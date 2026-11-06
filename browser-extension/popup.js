const $ = (id) => document.getElementById(id);
const get = (keys) => new Promise(resolve => chrome.storage.local.get(keys, resolve));
const set = (values) => new Promise(resolve => chrome.storage.local.set(values, resolve));
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
  $("statusHint").textContent=!configured?"Create a PIN to activate website protection.":locked?"Protected sites are covered by the privacy screen.":"Your PIN is ready. Lock whenever you step away.";
  $("statusDot").style.background=locked?"#ff668c":configured?"#8ce8b5":"#bd72ff";
  $("setupSection").classList.toggle("hidden",configured);
  $("controlSection").classList.toggle("hidden",!configured);
}
async function refresh(){const d=await get(["pinHash","pinSalt","locked"]);showStatus(Boolean(d.locked),Boolean(d.pinHash&&d.pinSalt));}
$("savePin").addEventListener("click",async()=>{
  const pin=$("newPin").value, confirm=$("confirmPin").value;
  if(pin.length<6)return alert("Use at least 6 characters.");
  if(pin!==confirm)return alert("The PIN entries do not match.");
  const salt=crypto.getRandomValues(new Uint8Array(16));
  const saltText=Array.from(salt,b=>b.toString(16).padStart(2,"0")).join("");
  const pinHash=await digestPin(pin,saltText);
  await set({pinHash,pinSalt:saltText,locked:true});
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
refresh();