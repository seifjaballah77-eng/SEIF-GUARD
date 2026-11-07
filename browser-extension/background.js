// SEIF-GUARD background service worker
async function registerCustomSiteScript(){
  if(!chrome.scripting?.registerContentScripts)return;
  const data=await chrome.storage.local.get(["protectedSites"]);
  const domains=Array.isArray(data.protectedSites)?data.protectedSites:[];
  const matches=domains.flatMap(domain=>[`https://${domain}/*`,`https://*.${domain}/*`]);
  try{await chrome.scripting.unregisterContentScripts({ids:["seif-guard-custom-sites"]});}catch(error){}
  if(!matches.length)return;
  try{
    await chrome.scripting.registerContentScripts([{
      id:"seif-guard-custom-sites",matches:[...new Set(matches)],js:["content.js"],
      runAt:"document_idle",persistAcrossSessions:true
    }]);
  }catch(error){console.warn("SEIF-GUARD custom-site registration:",error);}
}

async function configureAutoLock(){
  const data=await chrome.storage.local.get(["autoLockMinutes"]);
  const minutes=Number(data.autoLockMinutes)||0;
  if(minutes>0) chrome.idle.setDetectionInterval(Math.max(15,minutes*60));
}

if(chrome.commands?.onCommand){
  chrome.commands.onCommand.addListener(async command=>{
    if(command==="toggle-privacy-lock"){
      const data=await chrome.storage.local.get(["pinHash","pinSalt"]);
      if(data.pinHash&&data.pinSalt) await chrome.storage.local.set({locked:true});
      return;
    }
    if(command==="hide-current-page"){
      const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true});
      if(tab?.id){
        try{await chrome.tabs.sendMessage(tab.id,{type:"seif-guard-panic-hide"});}catch(error){}
      }
    }
  });
}

if(chrome.idle?.onStateChanged){
  chrome.idle.onStateChanged.addListener(async state=>{
    if(state!=="active"){
      const data=await chrome.storage.local.get(["pinHash","pinSalt","autoLockMinutes"]);
      if((Number(data.autoLockMinutes)||0)>0 && data.pinHash && data.pinSalt){
        await chrome.storage.local.set({locked:true});
      }
    }
  });
}
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==="local"&&changes.autoLockMinutes)configureAutoLock();
});
if(chrome.runtime?.onInstalled)chrome.runtime.onInstalled.addListener(()=>{registerCustomSiteScript();configureAutoLock();});
if(chrome.runtime?.onStartup)chrome.runtime.onStartup.addListener(()=>{registerCustomSiteScript();configureAutoLock();});
if(chrome.runtime?.onMessage){
  chrome.runtime.onMessage.addListener(message=>{
    if(message?.type==="register-custom-sites")registerCustomSiteScript();
    if(message?.type==="configure-auto-lock")configureAutoLock();
  });
}
registerCustomSiteScript();
configureAutoLock();