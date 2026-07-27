/* =========================================================
   mobile-play.js

   Maqsad:
   - Mobile ke liye ALAG se game URL set karne ki zaroorat
     khatam. Yeh script khud desktop wale iframe
     (#test_app_frame) ke "src" se game URL utha kar mobile
     wale iframe (#gameFrame) me use karti hai.
   - "Play now" click -> iframe load hota hai, fullscreen +
     landscape lock try hoti hai.
   - "Exit" click (ya fullscreen khud exit ho) -> iframe
     auto-pause: src ko "about:blank" kar diya jata hai
     (URL dobara set karna game ko RESTART nahi karta, is
     liye blank karna hi asli "pause/stop" hai).
   ========================================================= */

(function () {
  "use strict";

  const playBtn = document.getElementById("playBtn");
  const overlay = document.getElementById("gameOverlay");
  const closeBtn = document.getElementById("closeBtn");
  const gameFrame = document.getElementById("gameFrame");
  const desktopFrame = document.getElementById("test_app_frame");

  if (!playBtn || !overlay || !closeBtn || !gameFrame) return;

  /**
   * Game ka asal URL nikalta hai — PEHLE desktop wale iframe
   * (#test_app_frame) ke "data-src" se (kyunke desktop-frame-guard.js
   * ab mobile par uska "src" khali rakhti hai), warna uske
   * "src" attribute se (agar guard script use nahi ho rahi),
   * warna gameFrame ka apna maujooda "src" fallback ke taur par.
   */
  function resolveGameUrl() {
    if (desktopFrame) {
      if (desktopFrame.dataset.src) return desktopFrame.dataset.src;
      if (desktopFrame.getAttribute("src")) return desktopFrame.getAttribute("src");
    }
    return gameFrame.dataset.gameUrl || gameFrame.getAttribute("src") || "";
  }

  // Ek hi baar (page load par) URL yaad rakh lo, taake Play aur
  // Exit dono ke liye same value milti rahe, chahe baad me
  // gameFrame ka src khali/blank ho jaye.
  const initialUrl = resolveGameUrl();
  if (initialUrl) {
    gameFrame.dataset.gameUrl = initialUrl;
  }

  playBtn.addEventListener("click", async () => {
    const url = gameFrame.dataset.gameUrl || resolveGameUrl();
    if (url) {
      gameFrame.src = url;
    }
    overlay.classList.add("active");

    try {
      if (overlay.requestFullscreen) {
        await overlay.requestFullscreen();
      } else if (overlay.webkitRequestFullscreen) {
        overlay.webkitRequestFullscreen();
      }
    } catch (e) {}

    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock("landscape");
      }
    } catch (e) {}
  });

  function closeGame() {
    overlay.classList.remove("active");

    // Auto-pause: iframe ko unload/blank kar do. Same URL dobara
    // assign karne se browser reload guarantee nahi karta, is
    // liye "about:blank" hi reliable tareeqa hai.
    gameFrame.src = "about:blank";

    try {
      if (screen.orientation && screen.orientation.unlock) {
        screen.orientation.unlock();
      }
    } catch (e) {}

    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  closeBtn.addEventListener("click", closeGame);

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && overlay.classList.contains("active")) {
      closeGame();
    }
  });
})();