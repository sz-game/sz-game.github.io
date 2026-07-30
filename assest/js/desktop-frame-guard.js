/* =========================================================
   desktop-frame-guard.js

   Masla: desktop wala game iframe (#test_app_frame) mobile
   view me bhi DOM me maujood rehta hai (sirf CSS se chhupa
   hota hai), lekin agar uska "src" set ho to browser use
   load kar deta hai — is liye mobile par background me
   sound/game chalta rehta hai.

   Fix: HTML me is iframe par "src" ki jagah "data-src"
   rakhein (neeche dekhein). Yeh script khud decide karti
   hai ke asal "src" kab set karna hai:
     - Agar desktop view VISIBLE hai -> src load karo
     - Agar mobile view active hai   -> src blank rakho
       (ya blank kar do agar pehle se load ho chuka ho)

   Zaroori HTML change (ek hi jagah):
     PEHLE: <iframe id="test_app_frame" src="...">
     AB:    <iframe id="test_app_frame" data-src="...">
   ========================================================= */

(function () {
  "use strict";

  const desktopFrame = document.getElementById("test_app_frame");
  // Aapke page ke structure ke mutabiq desktop/mobile ka
  // asal wrapper — yeh wahi class hai jo CSS se show/hide hoti hai.
  const desktopWrapper = document.querySelector(".desktopVersion");

  if (!desktopFrame) return;

  // Agar kisi wajah se abhi bhi "src" seedha HTML me set hai
  // (data-src wali tabdeeli nahi hui), to usay data-src me
  // move kar ke turant hata do — taake yeh cheez guarantee ho
  // ke mobile par load na ho.
  if (!desktopFrame.dataset.src) {
    const inlineSrc = desktopFrame.getAttribute("src");
    if (inlineSrc) {
      desktopFrame.dataset.src = inlineSrc;
    }
  }
  desktopFrame.removeAttribute("src");

  function isDesktopVisible() {
    if (!desktopWrapper) return true; // wrapper na mile to safe default
    const style = window.getComputedStyle(desktopWrapper);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function syncDesktopFrame() {
    const shouldLoad = isDesktopVisible();
    const hasSrc = !!desktopFrame.getAttribute("src");

    if (shouldLoad && !hasSrc && desktopFrame.dataset.src) {
      // Desktop view abhi visible hai aur iframe khali hai -> load karo
      desktopFrame.setAttribute("src", desktopFrame.dataset.src);
    } else if (!shouldLoad && hasSrc) {
      // Mobile view active hai lekin desktop iframe load ho chuka -> band karo
      desktopFrame.removeAttribute("src");
    }
  }

  // Turant check karo
  syncDesktopFrame();

  // Screen resize / rotate hone par dobara check (debounce ke sath)
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncDesktopFrame, 150);
  });
})();