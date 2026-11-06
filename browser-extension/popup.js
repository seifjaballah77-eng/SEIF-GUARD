const $ = (id) => document.getElementById(id);
const get = (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve));
const set = (values) => new Promise(resolve => chrome.storage.local.set(values, resolve));
const DEFAULT_SITES=["web.whatsapp.com","web.telegram.org","messenger.com","instagram.com"];
const SITE_NAMES={"web.whatsapp.com":"WhatsApp Web","web.telegram.org":"Telegram Web","messenger.com":"Messenger","instagram.com":"Instagram"};
async function digestPin(pin, salt) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(pin), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({name:"PBKDF2",salt:encoder.encode(salt),iterations:210000,hash:"SHA-256"},key,256);
  return Array.from(new Uint8Array(bits), b => b.toString(16).padStart(2,"0")).join("");
}
async function verifyPin(pin,data) {
  if(!data.pinHash||!data.pinSalt)return false;
  return (await digestPin(pin,data.pinSalt))===data.pinHash;
}
function showStatus(locked,configured) {
  $("statusText").textContent=!configured?"Setup required":locked?"Privacy lock is ON":"Protection is ready";
  $("statusHint").textContent=!configured?"Create a PIN to activate website protection.":locked?"Selected websites are covered by the privacy screen.":"Your PIN is ready. Choose which websites to protect below.";
  $("statusDot").style.background=locked?"#ff668c":configured?"#8ce8b5":"#bd72ff";
  $("setupSection").classList.toggle("hidden",configured);
  $("controlSection").classList.toggle("hidden",!configured);
}
async function refresh(){
  const d=await get(["pinHash","pinSalt","locked","protectedSites"]);
  showStatus(Boolean(d.locked),Boolean(d.pinHash&&d.pinSalt));
  if(!Array.isArray(d.protectedSites)){await set({protectedSites:DEFAULT_SITES});d.protectedSites=DEFAULT_SITES;}
  renderSites(d.protectedSites);
}
function renderSites(sites){
  const list=$("siteList");list.replaceChildren();
  sites.forEach(domain=>{
    const row=document.createElement("div");row.className="site-row";
    const label=document.createElement("label");label.className="site-label";
    const check=document.createElement("input");check.type="checkbox";check.checked=true;check.setAttribute("aria-label","Protect "+domain);
    const name=document.createElement("span");name.textContent=SITE_NAMES[domain]||domain;
    label.append(check,name);
    const remove=document.createElement("button");remove.className="remove-site";remove.type="button";remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+domain);
    check.addEventListener("change",async()=>{
      const d=await get(["enabledSites"]);const enabled=Array.isArray(d.enabledSites)?d.enabledSites:sites.slice();
      const next=check.checked?[...new Set([...enabled,domain])]:enabled.filter(x=>x!==domain);
      await set({enabledSites:next});await refreshEnabledList(sites);
    });
    remove.addEventListener("click",async()=>{
      const d=await get(["protectedSites","enabledSites"]);
      await set({protectedSites:(d.protectedSites||[]).filter(x=>x!==domain),enabledSites:(d.enabledSites||sites).filter(x=>x!==domain)});
      await refresh();
    });
    row.append(label,remove);list.append(row);
  });
  get(["enabledSites"]).then(d=>{
    const enabled=Array.isArray(d.enabledSites)?d.enabledSites:sites;
    list.querySelectorAll("input[type=checkbox]").forEach((check,i)=>{check.checked=enabled.includes(sites[i]);});
  });
}
async function refreshEnabledList(){const d=await get(["protectedSites"]);renderSites(d.protectedSites||DEFAULT_SITES);}
$("savePin").addEventListener("click",async()=>{
  const pin=$("newPin").value, confirm=$("confirmPin").value;
  if(pin.length<6)return alert("Use at least 6 characters.");
  if(pin!==confirm)return alert("The PIN entries do not match.");
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const saltText=Array.from(salt,b=>b.toString(16).padStart(2,"0")).join("");
  const pinHash=await digestPin(pin,saltText);
  await set({pinHash,pinSalt:saltText,locked:true,protectedSites:DEFAULT_SITES,enabledSites:DEFAULT_SITES});
  $("newPin").value="";$("confirmPin").value="";await refresh();
});
async function changeLock(locked){
  const d=await get(["pinHash","pinSalt"]),pin=$("pinInput").value;
  if(!await verifyPin(pin,d)){$("feedback").textContent="Incorrect PIN. Protection was not changed.";return;}
  await set({locked});$("pinInput").value="";
  $("feedback").textContent=locked?"Privacy lock activated.":"Privacy lock deactivated.";
  await refresh();
}
$("lockButton").addEventListener("click",()=>changeLock(true));
$("unlockButton").addEventListener("click",()=>changeLock(false));
$("addSite").addEventListener("click",async()=>{
  const feedback=$("siteFeedback");feedback.textContent="";
  let url;
  try{url=new URL($("siteAddress").value.trim());}catch{feedback.textContent="Enter a valid website address.";return;}
  if(url.protocol!=="https:"){feedback.textContent="For safety, add an HTTPS website address.";return;}
  const domain=url.hostname.toLowerCase().replace(/^www\./,"");
  if(!domain||domain==="localhost"){feedback.textContent="Enter a public website domain.";return;}
  if(!chrome.scripting?.registerContentScripts){feedback.textContent="Custom website protection requires Chrome or Edge. Built-in sites still work here.";return;}
  const patterns=[`https://${domain}/*`,`https://*.${domain}/*`];
  try{
    const granted=await chrome.permissions.request({origins:patterns});
    if(!granted){feedback.textContent="Permission was not granted. The website was not added.";return;}
    const d=await get(["protectedSites","enabledSites"]);
    const sites=Array.isArray(d.protectedSites)?d.protectedSites:DEFAULT_SITES;
    await set({protectedSites:[...new Set([...sites,domain])],enabledSites:[...new Set([...(d.enabledSites||sites),domain])]});
    chrome.runtime.sendMessage({type:"register-custom-sites"});
    $("siteAddress").value="";feedback.textContent="Website added. It will be locked whenever the privacy lock is ON.";
    await refresh();
  }catch(error){feedback.textContent="Could not add this website: "+(error.message||"permission error");}
});
refresh();
