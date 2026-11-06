if(chrome.commands&&chrome.commands.onCommand){
  chrome.commands.onCommand.addListener((command)=>{
    if(command!=="toggle-privacy-lock")return;
    chrome.storage.local.get(["pinHash","pinSalt"],(data)=>{
      if(!data.pinHash||!data.pinSalt)return;
      chrome.storage.local.set({locked:true});
    });
  });
}

// Custom-site support for Chromium: the user grants access only to each
// domain they add. The registered script runs only on origins the browser
// has actually granted to this extension.
async function registerCustomSiteScript(){
  if(!chrome.scripting?.registerContentScripts)return;
  try{
    const existing=await chrome.scripting.getRegisteredContentScripts({ids:["seif-guard-custom-sites"]});
    if(existing.length)return;
    await chrome.scripting.registerContentScripts([{
      id:"seif-guard-custom-sites",
      matches:["https://*/*"],
      js:["content.js"],
      runAt:"document_idle",
      persistAcrossSessions:true
    }]);
  }catch(error){console.warn("SEIF-GUARD custom-site registration:",error);}
}
if(chrome.runtime?.onInstalled)chrome.runtime.onInstalled.addListener(registerCustomSiteScript);
if(chrome.runtime?.onStartup)chrome.runtime.onStartup.addListener(registerCustomSiteScript);
registerCustomSiteScript();

if(chrome.runtime?.onMessage){
  chrome.runtime.onMessage.addListener((message)=>{
    if(message?.type==="register-custom-sites")registerCustomSiteScript();
  });
}
