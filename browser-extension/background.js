// SEIF-GUARD background service worker
async function registerCustomSiteScript(){
  if(!chrome.scripting?.registerContentScripts)return;
  const data=await chrome.storage.local.get(["protectedSites"]);
  const domains=Array.isArray(data.protectedSites)?data.protectedSites:[];
  const matches=domains.flatMap(domain=>[`https://${domain}/*`,`https://*.${domain}/*`]);
  try{await chrome.scripting.unregisterContentScripts({ids:["seif-guard-custom-sites"]});}catch(error){}
  if(!matches.length)return;
  try{await chrome.scripting.registerContentScripts([{id:"seif-guard-custom-sites",matches:[...new Set(matches)],js:["content.js"],runAt:"document_idle",persistAcrossSessions:true}]);}
  catch(error){console.warn("SEIF-GUARD custom-site registration:",error);}
}
async function configureAutoLock(){
  const data=await chrome.storage.local.get(["autoLockMinutes"]);
  const minutes=Number(data.autoLockMinutes)||0;
  if(minutes>0)chrome.idle.setDetectionInterval(Math.max(15,minutes*60));
}

// Google Safe Browsing Lookup API. The user supplies and stores their own API key locally.
async function checkWithSafeBrowsing(url){
  const {safeBrowsingApiKey}=await chrome.storage.local.get(["safeBrowsingApiKey"]);
  if(!safeBrowsingApiKey)return {status:"not_configured"};
  try{
    const response=await fetch("https://safebrowsing.googleapis.com/v4/threatMatches:find?key="+encodeURIComponent(safeBrowsingApiKey),{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        client:{clientId:"seif-guard",clientVersion:"0.4.0"},
        threatInfo:{
          threatTypes:["MALWARE","SOCIAL_ENGINEERING","UNWANTED_SOFTWARE"],
          platformTypes:["ANY_PLATFORM"],
          threatEntryTypes:["URL"],
          threatEntries:[{url}]
        }
      })
    });
    if(!response.ok)return {status:"error",code:response.status};
    const result=await response.json();
    return result.matches?.length
      ? {status:"dangerous",threats:result.matches.map(x=>x.threatType)}
      : {status:"safe"};
  }catch(error){
    return {status:"error"};
  }
}
if(chrome.runtime?.onMessage){
  chrome.runtime.onMessage.addListener((message,sender,sendResponse)=>{
    if(message?.type==="sg-check-url" && typeof message.url==="string"){
      checkWithSafeBrowsing(message.url).then(sendResponse);
      return true;
    }
    if(message?.type==="register-custom-sites")registerCustomSiteScript();
    if(message?.type==="configure-auto-lock")configureAutoLock();
  });
}
if(chrome.commands?.onCommand){
  chrome.commands.onCommand.addListener(async command=>{
    if(command==="toggle-privacy-lock"){
      const data=await chrome.storage.local.get(["pinHash","pinSalt"]);
      if(data.pinHash&&data.pinSalt)await chrome.storage.local.set({locked:true});
      return;
    }
    if(command==="hide-current-page"){
      const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});
      if(tab?.id){try{await chrome.tabs.sendMessage(tab.id,{type:"seif-guard-panic-hide"});}catch(error){}}
    }
  });
}
if(chrome.idle?.onStateChanged){
  chrome.idle.onStateChanged.addListener(async state=>{
    if(state!=="active"){
      const data=await chrome.storage.local.get(["pinHash","pinSalt","autoLockMinutes"]);
      if((Number(data.autoLockMinutes)||0)>0&&data.pinHash&&data.pinSalt)await chrome.storage.local.set({locked:true});
    }
  });
}
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==="local"&&changes.autoLockMinutes)configureAutoLock();
});
if(chrome.runtime?.onInstalled)chrome.runtime.onInstalled.addListener(()=>{registerCustomSiteScript();configureAutoLock();});
if(chrome.runtime?.onStartup)chrome.runtime.onStartup.addListener(()=>{registerCustomSiteScript();configureAutoLock();});
registerCustomSiteScript();
configureAutoLock();