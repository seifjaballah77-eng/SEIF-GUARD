(() => {
  if (window.top !== window || window.__seifGuardPhishingInstalled) return;
  window.__seifGuardPhishingInstalled = true;

  const suspiciousShorteners = new Set(["bit.ly","tinyurl.com","t.co","is.gd","cutt.ly","rb.gy","rebrand.ly","shorturl.at"]);
  const brandNames = ["google","paypal","apple","microsoft","facebook","instagram","whatsapp","telegram","amazon","netflix","bank"];
  let activeDialog = null;

  function inspectLocally(raw) {
    let u;
    try { u = new URL(raw, location.href); } catch { return ["Invalid or malformed URL"]; }
    const host = u.hostname.toLowerCase();
    const flags = [];
    if (u.protocol !== "https:" && u.protocol !== "http:") flags.push("Unusual link protocol");
    if (u.username || u.password) flags.push("URL contains hidden login credentials");
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push("Website uses a raw IP address");
    if (host.startsWith("xn--") || host.split(".").some(x => x.startsWith("xn--"))) flags.push("Internationalized/punycode domain");
    if (suspiciousShorteners.has(host)) flags.push("URL shortener hides the destination");
    if (host.split(".").some(part => part.length > 30)) flags.push("Unusually long domain label");
    if (/(login|verify|secure|account|update|wallet|password|signin)/i.test(u.pathname) &&
        brandNames.some(b => host.includes(b)) && !brandNames.some(b => host === b + ".com" || host.endsWith("." + b + ".com"))) {
      flags.push("Possible brand impersonation in a login-related URL");
    }
    if (brandNames.some(b => host.includes(b)) && !host.split(".").some(part => part === b) && host.split(".").length > 1) {
      flags.push("Brand name appears inside a non-matching domain");
    }
    if (host.split("-").length >= 4) flags.push("Domain contains many hyphen-separated parts");
    return flags;
  }

  function closeDialog() {
    if (activeDialog) activeDialog.remove();
    activeDialog = null;
  }
  function showWarning(title, details, onContinue, allowContinue = true) {
    closeDialog();
    const root = document.createElement("div");
    root.id = "seif-guard-phishing-warning";
    root.innerHTML = `<div class="sgp-card" role="alertdialog" aria-modal="true">
      <div class="sgp-icon">!</div><div class="sgp-brand">SEIF-GUARD · LINK PROTECTION</div>
      <h2></h2><p class="sgp-intro"></p><ul></ul>
      <p class="sgp-note">لا تدخل كلمة مرور أو بيانات بنكية في موقع لا تثق به.</p>
      <div class="sgp-actions"><button class="sgp-cancel">العودة إلى الأمان</button><button class="sgp-continue">متابعة على مسؤوليتي</button></div>
    </div>`;
    const style = document.createElement("style");
    style.textContent = `#seif-guard-phishing-warning{position:fixed!important;inset:0!important;z-index:2147483647!important;background:#08050eeF!important;display:grid!important;place-items:center!important;font-family:Arial, sans-serif!important;color:#fff!important;padding:18px!important}#seif-guard-phishing-warning *{box-sizing:border-box!important}#seif-guard-phishing-warning .sgp-card{width:min(430px,100%);background:#140d1d;border:1px solid #a34c60;border-radius:20px;padding:26px;box-shadow:0 20px 90px #000;text-align:center}#seif-guard-phishing-warning .sgp-icon{margin:auto auto 12px;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;background:#451b2b;border:1px solid #ff668c;color:#ff9bb2;font-size:30px;font-weight:900}#seif-guard-phishing-warning .sgp-brand{font-size:10px;letter-spacing:1.6px;color:#d5a5ff;font-weight:bold}#seif-guard-phishing-warning h2{font-size:21px;margin:18px 0 8px;color:#fff}#seif-guard-phishing-warning p{font-size:13px;line-height:1.65;color:#cbbbd5}#seif-guard-phishing-warning ul{text-align:left;direction:ltr;background:#241421;border-radius:10px;padding:12px 12px 12px 30px;color:#ffb4c5;font-size:12px;line-height:1.8;overflow-wrap:anywhere}#seif-guard-phishing-warning .sgp-note{color:#ffcf8b;font-size:11px}#seif-guard-phishing-warning .sgp-actions{display:flex;gap:9px;margin-top:18px}#seif-guard-phishing-warning button{flex:1;border:0;border-radius:10px;padding:12px 8px;font-size:12px;font-weight:bold;cursor:pointer}#seif-guard-phishing-warning .sgp-cancel{background:#653047;color:white}#seif-guard-phishing-warning .sgp-continue{background:#30263a;color:#e9d9f4;border:1px solid #765b8b}`;
    root.append(style);
    document.documentElement.append(root);
    root.querySelector("h2").textContent = title;
    root.querySelector(".sgp-intro").textContent = details;
    const ul = root.querySelector("ul");
    for (const item of arguments[1] instanceof Array ? details : []) { const li=document.createElement("li");li.textContent=item;ul.append(li); }
    if (Array.isArray(details)) {
      root.querySelector(".sgp-intro").textContent = "تم رصد مؤشرات تستحق الحذر:";
      for (const item of details) { const li=document.createElement("li");li.textContent=item;ul.append(li); }
    } else {
      ul.remove();
    }
    root.querySelector(".sgp-cancel").addEventListener("click", closeDialog);
    const proceed = root.querySelector(".sgp-continue");
    if (!allowContinue) proceed.remove();
    else proceed.addEventListener("click", () => { closeDialog(); onContinue?.(); });
    activeDialog = root;
  }

  function navigate(url, target, blankTab) {
    if (blankTab) { try { blankTab.location.href = url; } catch { window.open(url, "_blank", "noopener"); } }
    else if (target === "_blank") window.open(url, "_blank", "noopener");
    else location.assign(url);
  }

  document.addEventListener("click", async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const anchor = event.target?.closest?.("a[href]");
    if (!anchor || anchor.hasAttribute("download")) return;
    const raw = anchor.href;
    let parsed;
    try { parsed = new URL(raw); } catch { return; }
    if (!["http:","https:"].includes(parsed.protocol) || parsed.origin === location.origin && parsed.hash && parsed.pathname === location.pathname) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    const target = anchor.target || "_self";
    const blankTab = target === "_blank" ? window.open("about:blank", "_blank") : null;
    const localFlags = inspectLocally(raw);
    let result = {status:"not_configured"};
    try {
      result = await new Promise(resolve => {
        chrome.runtime.sendMessage({type:"sg-check-url",url:raw}, response => {
          if (chrome.runtime.lastError) resolve({status:"error"});
          else resolve(response || {status:"error"});
        });
        setTimeout(() => resolve({status:"error"}), 6500);
      });
    } catch { result = {status:"error"}; }

    if (result.status === "dangerous") {
      if (blankTab) blankTab.close();
      showWarning("تحذير: رابط خطير", "أكد Google Safe Browsing أن هذا الرابط مرتبط بتهديد معروف.", result.threats || ["Threat detected"], true);
      return;
    }
    if (localFlags.length) {
      if (blankTab) blankTab.close();
      showWarning("رابط يثير الشك", localFlags, () => navigate(raw, target), true);
      return;
    }
    if (result.status === "error") {
      if (blankTab) blankTab.close();
      showWarning("تعذّر التحقق من الرابط", "لم نتمكن من الاتصال بخدمة فحص الروابط. هذا لا يعني أن الموقع آمن.", () => navigate(raw, target), true);
      return;
    }
    navigate(raw, target, blankTab);
  }, true);
})();