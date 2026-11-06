if(chrome.commands&&chrome.commands.onCommand){
  chrome.commands.onCommand.addListener((command)=>{
    if(command!=="toggle-privacy-lock")return;
    chrome.storage.local.get(["pinHash","pinSalt"],(data)=>{
      if(!data.pinHash||!data.pinSalt)return;
      // The shortcut may always lock, but it must never bypass the PIN to unlock.
      chrome.storage.local.set({locked:true});
    });
  });
}