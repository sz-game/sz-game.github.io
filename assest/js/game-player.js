document.addEventListener("DOMContentLoaded", function () {
  // ==== 1. Current page ka game-slug + data uthao ====
  const wrapper = document.getElementById("gameFrameWrapper");
  const slug = wrapper ? wrapper.dataset.game : null;
  const gameData = (window.GAME_URLS && slug) ? window.GAME_URLS[slug] : null;
  const gameUrl = gameData ? gameData.url : null;
  const hasOwnPlay = gameData ? !!gameData.hasOwnPlay : false;

  console.log("[game-player] slug:", slug, "| gameUrl:", gameUrl, "| hasOwnPlay:", hasOwnPlay);

  if (!gameUrl) {
    console.warn("⚠️ Game URL nahi mila mapping me. Slug:", slug);
    return;
  }

  // ==== Helper: iframe ko load karo BINA "src" HTML attribute set kiye ====
  // (yeh SEO tools / view-source / DOM-attribute-scanners ko "blank" dikhata hai,
  //  lekin Network tab ya manual inspection se ab bhi asal URL mil sakta hai)
  function loadIframeHidden(iframeEl, url) {
    if (!iframeEl) return;
    try {
      iframeEl.contentWindow.location.replace(url);
    } catch (e) {
      // Fallback: agar kisi wajah se contentWindow access na ho to normal src set kar do
      console.warn("[game-player] hidden-load fail, falling back to src:", e);
      iframeEl.src = url;
    }
  }

  // ==== 2. Elements pakdo ====
  const desktopFrame = document.getElementById("test_app_frame");
  const mobileFrame = document.getElementById("gameFrame");

  const playGameBtn = document.getElementById("playGameBtn"); // desktop splash button
  const playBtn = document.getElementById("playBtn");         // mobile card button
  const gameSplash = document.getElementById("gameSplash");
  const gameOverlay = document.getElementById("gameOverlay");
  const closeBtn = document.getElementById("closeBtn");

  // ==== 3. DESKTOP: agar game ka apna play button hai to HUMARA splash hide, seedha iframe load ====
  if (hasOwnPlay) {
    if (gameSplash) gameSplash.style.display = "none";
    if (desktopFrame) {
      desktopFrame.style.display = "block";
      loadIframeHidden(desktopFrame, gameUrl);   // <-- CHANGE 1 (yahan pehle desktopFrame.src = gameUrl tha)
    }
    console.log("[game-player] hasOwnPlay=true -> humara splash hide kiya, iframe seedha load ho gaya");
  } else {
    // Normal flow: humara PLAY button click hone par iframe load hoga
    if (playGameBtn) {
      playGameBtn.addEventListener("click", () => {
        playGameBtn.classList.add("slide-out");
        setTimeout(() => {
          if (gameSplash) gameSplash.style.display = "none";
          if (desktopFrame) {
            desktopFrame.style.display = "block";
            loadIframeHidden(desktopFrame, gameUrl);   // <-- CHANGE 1 (yahan bhi wahi line)
          }
        }, 600);
      });
    }
  }

  // ==== 4. MOBILE: overlay khulte hi seedha iframe load kar do ====
  function openMobileOverlay() {
    if (!gameOverlay || !mobileFrame) return;

    const needsReload =
      mobileFrame.dataset.loaded !== "1" ||
      mobileFrame.dataset.needsReload === "1";

    if (needsReload) {
      loadIframeHidden(mobileFrame, gameUrl);    // <-- CHANGE 2 (yahan pehle mobileFrame.setAttribute("src", gameUrl) tha)
      mobileFrame.dataset.loaded = "1";
      mobileFrame.dataset.needsReload = "0";
    }
    gameOverlay.classList.add("gb-overlay-open");
    gameOverlay.style.display = "flex";
    document.body.style.overflow = "hidden";
  }

  if (playBtn) playBtn.addEventListener("click", openMobileOverlay);

  if (closeBtn && gameOverlay) {
    closeBtn.addEventListener("click", () => {
      gameOverlay.classList.remove("gb-overlay-open");
      gameOverlay.style.display = "none";
      document.body.style.overflow = "";
      if (mobileFrame) {
        loadIframeHidden(mobileFrame, "about:blank"); // reset, taake game pause/stop ho jaye
        mobileFrame.dataset.needsReload = "1";
      }
    });
  }
});