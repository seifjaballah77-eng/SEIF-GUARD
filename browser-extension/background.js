if(chrome.commands&&chrome.commands.onCommand){
  chrome.commands.onCommand.addListener((command)=>{
    if(command!=="toggle-privacy-lock")return;
    chrome.storage.local.get(["pinHash","pinSalt"],(data)=>{
      if(!data.pinHash||!data.pinSalt)return;
      chrome.storage.local.set({locked:true});
    });
  });
}

// Register only the domains the user has added. This avoids asking for
// blanket access to every website.
async function registerCustomSiteScript(){
  if(!chrome.scripting?.registerContentScripts)return;
  const data=await chrome.storage.local.get(["protectedSites"]);
  const domains=Array.isArray(data.protectedSites)?data.protectedSites:[];
  const matches=domains.flatMap(domain=>[`https://${domain}/*`,`https://*.${domain}/*`]);
  try{
    await chrome.scripting.unregisterContentScripts({ids:["seif-guard-custom-sites"]});
  }catch(error){}
  if(!matches.length)return;
  try{
    await chrome.scripting.registerContentScripts([{
      id:"seif-guard-custom-sites",
      matches:[...new Set(matches)],
      js:["content.js"],
      runAt:"document_idle",
      persistAcrossSessions:true
    }]);
  }catch(error){console.warn("SEIF-GUARD custom-site registration:",error);}
}
if(chrome.runtime?.onInstalled)chrome.runtime.onInstalled.addListener(registerCustomSiteScript);
if(chrome.runtime?.onStartup)chrome.runtime.onStartup.addListener(registerCustomSiteScript);
if(chrome.runtime?.onMessage){
  chrome.runtime.onMessage.addListener((message)=>{
    if(message?.type==="register-custom-sites")registerCustomSiteScript();
  });
}
registerCustomSiteScript();
