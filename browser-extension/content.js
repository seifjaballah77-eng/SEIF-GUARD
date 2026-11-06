(() => {
  if(window.top!==window)return;
  let overlay=null, pageUnlocked=false;
  const DEFAULT_SITES=["web.whatsapp.com","web.telegram.org","messenger.com","www.messenger.com","instagram.com","www.instagram.com"];
  function isProtectedSite(sites){
    const host=location.hostname.toLowerCase();
    return (Array.isArray(sites)?sites:DEFAULT_SITES).some(item=>{
      const domain=String(item).toLowerCase().replace(/^https?:\\/\\//,"").replace(/^\\*\\./,"").split("/")[0].split(":")[0];
      return domain && (host===domain || host.endsWith("."+domain));
    });
  }
  async function digestPin(pin,salt){
    const enc=new TextEncoder();
    const key=await crypto.subtle.importKey("raw",enc.encode(pin),"PBKDF2",false,["deriveBits"]);
    const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:enc.encode(salt),iterations:210000,hash:"SHA-256"},key,256);
    return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,"0")).join("");
  }
  function removeOverlay(){if(overlay)overlay.remove();overlay=null;}
  function showOverlay(){
    if(overlay||pageUnlocked)return;
    overlay=document.createElement("div");overlay.id="seif-guard-screen";
    overlay.innerHTML="<div class='sg-card'><div class='sg-mark'>S</div><div class='sg-brand'>SEIF-GUARD</div><div class='sg-title'>This page is protected</div><div class='sg-sub'>Enter your privacy PIN to reveal this page.</div><form id='sg-form'><input id='sg-pin' type='password' autocomplete='current-password' placeholder='Enter PIN' aria-label='Privacy PIN'><button type='submit'>Unlock this page</button><div id='sg-error' role='status'></div></form><div class='sg-foot'>YOUR PRIVACY · YOUR CONTROL</div></div>";
    const style=document.createElement("style");
    style.textContent="#seif-guard-screen{position:fixed!important;inset:0!important;z-index:2147483647!important;background:radial-gradient(ellipse at 50% 35%,#241039,#08050e 72%)!important;display:grid!important;place-items:center!important;font-family:Inter,Segoe UI,Arial,sans-serif!important;color:#fff!important}#seif-guard-screen *{box-sizing:border-box!important}#seif-guard-screen .sg-card{width:min(360px,calc(100vw - 36px));padding:30px 26px;border:1px solid #68408a;border-radius:20px;background:#100a19;box-shadow:0 20px 90px #000b,0 0 35px #9d43e833;text-align:center}#seif-guard-screen .sg-mark{margin:0 auto 13px;width:52px;height:52px;border:1px solid #c078ff;border-radius:16px;display:grid;place-items:center;color:#edceff;font-size:27px;font-weight:900;box-shadow:0 0 22px #a84df755}#seif-guard-screen .sg-brand{font-size:12px;letter-spacing:2px;color:#dcbaff;font-weight:800}#seif-guard-screen .sg-title{font-size:20px;font-weight:700;margin-top:24px}#seif-guard-screen .sg-sub{font-size:12px;color:#b6a4c5;margin:9px 0 20px}#seif-guard-screen input{width:100%;padding:13px;border-radius:10px;border:1px solid #5c3976;background:#08060d;color:white;font-size:15px;outline:none}#seif-guard-screen button{width:100%;padding:13px;margin-top:11px;border:0;border-radius:10px;background:linear-gradient(110deg,#a83df0,#6d35c9);color:white;font-weight:800;cursor:pointer}#seif-guard-screen #sg-error{min-height:18px;margin-top:10px;color:#ff8aa9;font-size:11px}#seif-guard-screen .sg-foot{margin-top:20px;font-size:8px;letter-spacing:1.8px;color:#806993}";
    overlay.append(style);document.documentElement.append(overlay);
    overlay.querySelector("#sg-pin").focus();
    overlay.querySelector("#sg-form").addEventListener("submit",event=>{
      event.preventDefault();const pin=overlay.querySelector("#sg-pin").value;
      chrome.storage.local.get(["pinHash","pinSalt"],async d=>{
        if(!d.pinHash||!d.pinSalt)return;
        if(await digestPin(pin,d.pinSalt)===d.pinHash){pageUnlocked=true;removeOverlay();}
        else{overlay.querySelector("#sg-error").textContent="Incorrect PIN. Try again.";overlay.querySelector("#sg-pin").value="";overlay.querySelector("#sg-pin").focus();}
      });
    });
  }
  function applyState(d){
    const enabled=Array.isArray(d.enabledSites)?d.enabledSites:d.protectedSites;\n    if(!isProtectedSite(d.protectedSites)||!isProtectedSite(enabled)||!d.pinHash||!d.pinSalt||!d.locked){pageUnlocked=false;removeOverlay();return;}
    pageUnlocked=false;
    showOverlay();
  }
  chrome.storage.local.get(["pinHash","pinSalt","locked","protectedSites","enabledSites"],applyState);
  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area==="local")chrome.storage.local.get(["pinHash","pinSalt","locked","protectedSites"],applyState);
  });
})();
