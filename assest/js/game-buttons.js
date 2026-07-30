/* =========================================================
   game-buttons.js
   Yeh script Controls, Share, Refresh, Fullscreen (desktop)
   aur mobile Play Now / Exit (auto-pause) buttons ko
   working banati hai.

   Like / Dislike buttons ko is script me touch NAHI kiya gaya
   (jaisa aap ne bola, wo pehle se working hain).

   Isko apne page ke </body> se pehle <script src="game-buttons.js"></script>
   ke through include kar dein.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     0) CONFIG — HAR GAME KE ALAG CONTROLS

     Key = game ka "slug" (uski folder ka naam, e.g.
     "games/drive-mad/index.html" ka slug hai "drive-mad").

     Jitne bhi games aap ki site par hain, unka slug yahan
     add karte jayein — naya game add karna ho to sirf ek
     naya entry is object me add karein, JS ka baaqi hissa
     khud-ba-khud sambhal lega.
     --------------------------------------------------------- */
  const CONTROLS_MAP = {
    "10-minutes-till-dawn": [
      "WASD = move",
      "Right-click / V = aim",
      "Left-click = shoot",
      "F = use / pick up item",
      "Tab = menu",
      "Left-shift = sprint",
      "Space = jump",
      "C = crouch"
    ],
    "1v1-lol": [
      "WASD = move",
      "Mouse = aim",
      "Left-click = shoot / place",
      "1, 2, 3 = switch build (wall / ramp / floor)",
      "Space = jump",
      "Left-shift = sprint",
      "R = reload",
      "C = crouch"
    ],
    "drive-mad": [
      "Up arrow / W = accelerate",
      "Down arrow / S = reverse / brake",
      "Left / Right arrow = tilt / steer",
      "R = restart level",
      "Space = handbrake (kuch levels me)"
    ]
    // Naya game add karna ho, misal:
    // "game-slug-yahan": ["Control 1", "Control 2", ...],
  };

  // Agar kisi game ka slug map me na mile to yeh generic
  // list dikhai jayegi (fallback).
  const FALLBACK_CONTROLS = [
    "WASD / Arrow keys = move",
    "Mouse = aim / look around",
    "Left-click = interact / shoot",
    "Space = jump",
    "Esc = pause menu"
  ];

  const GAME_TITLE = document.querySelector("h2.n162, .game-card h1")
    ? (document.querySelector("h2.n162, .game-card h1").textContent || "").trim()
    : "This Game";

  /**
   * Kisi bhi URL/path se game ka "slug" (folder name) nikalta hai.
   *
   * Support karta hai dono tareeke:
   *   1) "https://site.com/drive-mad"              -> "drive-mad"
   *   2) "/games/drive-mad/index.html"              -> "drive-mad"
   *   3) "games/1v1-lol/index.htm"                  -> "1v1-lol"
   *
   * Yani agar URL ka aakhri part "index.html" (ya index.htm/.php)
   * ho, to uske SE PEHLE wala folder-name hi asli slug hai —
   * kyunke har game apni khud ki folder me "index.html" ke
   * andar hoti hai (gamename/index.html).
   */
  function getSlugFromUrl(url) {
    if (!url) return null;
    try {
      const clean = url.split("?")[0].split("#")[0].replace(/\/+$/, "");
      const parts = clean.split("/").filter(Boolean);
      if (parts.length === 0) return null;

      let last = parts[parts.length - 1];

      // Agar last segment "index.html" / "index.htm" / "index.php" hai
      // to us se pehle wala part (game folder ka naam) lo.
      if (/^index\.(html?|php)$/i.test(last) && parts.length > 1) {
        last = parts[parts.length - 2];
      }

      // Kisi bhi extension (.html/.htm/.php) ko slug se hata do,
      // taake agar kabhi game-name.html jaisi file bhi ho to bhi
      // sahi slug mile.
      last = last.replace(/\.(html?|php)$/i, "");

      return last || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Currently active game ka slug dhoond kar uske controls
   * wapas karta hai. Na mile to FALLBACK_CONTROLS deta hai.
   *
   * PRIORITY:
   *   1) Page ka apna URL (window.location) — kyunke site
   *      structure hi "site.com/g/gamename/index.html" hai,
   *      is liye yeh sabse reliable source hai (iframe ka src
   *      kabhi outdated/hardcoded ho sakta hai, jaisa testing
   *      me hua).
   *   2) Desktop iframe (#test_app_frame) ka src
   *   3) Mobile iframe (#gameFrame) ka src
   */
  function getControlsForCurrentGame() {
    const desktopFrame = document.getElementById("test_app_frame");
    const mobileFrame = document.getElementById("gameFrame");

    const candidates = [
      { label: "window.location.pathname", value: window.location.pathname },
      { label: "window.location.href", value: window.location.href },
      { label: "#test_app_frame src", value: desktopFrame ? desktopFrame.getAttribute("src") : null },
      { label: "#gameFrame src", value: mobileFrame ? mobileFrame.getAttribute("src") : null },
      { label: "#gameFrame data-original-src", value: mobileFrame ? mobileFrame.dataset.originalSrc : null }
    ];

    // eslint-disable-next-line no-console
    console.groupCollapsed("[game-buttons] Controls slug detection");
    let matched = null;
    candidates.forEach(({ label, value }) => {
      const slug = getSlugFromUrl(value);
      const isMatch = !!(slug && CONTROLS_MAP[slug]);
      if (isMatch && !matched) matched = slug;
      // eslint-disable-next-line no-console
      console.log(
        (isMatch ? "✅ MATCH  " : "   no match"),
        "|", label.padEnd(28, " "),
        "| raw:", value,
        "| slug:", slug
      );
    });
    // eslint-disable-next-line no-console
    console.log(matched ? `→ Using controls for: "${matched}"` : "→ No slug matched — using FALLBACK_CONTROLS");
    // eslint-disable-next-line no-console
    console.groupEnd();

    for (const { value } of candidates) {
      const slug = getSlugFromUrl(value);
      if (slug && CONTROLS_MAP[slug]) {
        return CONTROLS_MAP[slug];
      }
    }

    return FALLBACK_CONTROLS;
  }

  /* ---------------------------------------------------------
     1) MODAL STYLES (ek hi baar inject honge)
     --------------------------------------------------------- */
  const style = document.createElement("style");
  style.textContent = `
    .gb-overlay-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      opacity: 0;
      pointer-events: none;
      transition: opacity .15s ease;
    }
    .gb-overlay-backdrop.gb-show {
      opacity: 1;
      pointer-events: auto;
    }
    .gb-modal {
      background: #1d1e2c;
      border-radius: 16px;
      width: 360px;
      max-width: 90vw;
      max-height: 80vh;
      overflow-y: auto;
      padding: 28px 26px;
      position: relative;
      color: #fff;
      font-family: inherit;
      box-shadow: 0 10px 40px rgba(0,0,0,0.4);
      transform: translateY(10px);
      transition: transform .15s ease;
    }
    .gb-overlay-backdrop.gb-show .gb-modal {
      transform: translateY(0);
    }
    .gb-modal-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: transparent;
      border: none;
      color: #aaa;
      cursor: pointer;
      font-size: 22px;
      line-height: 1;
    }
    .gb-modal-close:hover { color: #fff; }
    .gb-modal h3 {
      text-align: center;
      font-size: 22px;
      font-weight: 800;
      margin: 0 0 22px 0;
    }
    .gb-controls-list {
      list-style: disc;
      padding-left: 20px;
      margin: 0;
    }
    .gb-controls-list li {
      margin-bottom: 14px;
      font-size: 15px;
      color: #e5e5ea;
    }
    .gb-share-icons {
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .gb-share-icons a {
      width: 46px;
      height: 46px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }
    .gb-share-fb { background: #1877f2; }
    .gb-share-x { background: #000; }
    .gb-share-wa { background: #25d366; }
    .gb-share-row {
      display: flex;
      align-items: center;
      background: #2a2b3c;
      border-radius: 10px;
      padding: 6px 6px 6px 14px;
      gap: 10px;
    }
    .gb-share-url {
      flex: 1;
      background: transparent;
      border: none;
      color: #cfcfe0;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      outline: none;
    }
    .gb-share-copy {
      background: #6c4cf1;
      color: #fff;
      border: none;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .gb-share-copy:hover { background: #5b3fe0; }
    .gb-share-copy.gb-copied { background: #2ecc71; }
  `;
  document.head.appendChild(style);

  /* ---------------------------------------------------------
     2) Helper: generic modal banane / dikhane / band karne ke liye
     --------------------------------------------------------- */
  function openModal(innerHTML) {
    const backdrop = document.createElement("div");
    backdrop.className = "gb-overlay-backdrop";
    backdrop.innerHTML = `<div class="gb-modal">
        <button class="gb-modal-close" aria-label="Close">&times;</button>
        ${innerHTML}
      </div>`;
    document.body.appendChild(backdrop);

    requestAnimationFrame(() => backdrop.classList.add("gb-show"));

    function close() {
      backdrop.classList.remove("gb-show");
      setTimeout(() => backdrop.remove(), 150);
    }

    backdrop.querySelector(".gb-modal-close").addEventListener("click", close);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) close();
    });
    document.addEventListener("keydown", function escHandler(e) {
      if (e.key === "Escape") {
        close();
        document.removeEventListener("keydown", escHandler);
      }
    });

    return { close };
  }

  /* ---------------------------------------------------------
     3) CONTROLS button
     --------------------------------------------------------- */
  function showControlsModal() {
    const controls = getControlsForCurrentGame();
    const listItems = controls.map((c) => `<li>${c}</li>`).join("");
    openModal(`
      <h3>Controls</h3>
      <ul class="gb-controls-list">${listItems}</ul>
    `);
  }

  /* ---------------------------------------------------------
     4) SHARE button
     --------------------------------------------------------- */
  function showShareModal() {
    const pageUrl = window.location.href;
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedTitle = encodeURIComponent(GAME_TITLE);

    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    const xUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    const waUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;

    const modal = openModal(`
      <h3>Share this game</h3>
      <div class="gb-share-icons">
        <a class="gb-share-fb" href="${fbUrl}" target="_blank" rel="noopener noreferrer" title="Share on Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.87h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94Z"/>
          </svg>
        </a>
        <a class="gb-share-x" href="${xUrl}" target="_blank" rel="noopener noreferrer" title="Share on X">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
            <path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.5 22H1.3l8.1-9.3L1 2h7l4.9 6L18.9 2Zm-1.2 18h1.9L7.4 4H5.4l12.3 16Z"/>
          </svg>
        </a>
        <a class="gb-share-wa" href="${waUrl}" target="_blank" rel="noopener noreferrer" title="Share on WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.06L2 22l5.1-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm5.1 14.24c-.24.68-1.4 1.3-1.94 1.36-.5.06-1.13.09-1.83-.11-.42-.12-.96-.31-1.66-.6-2.92-1.26-4.82-4.2-4.97-4.4-.15-.2-1.19-1.58-1.19-3.02 0-1.44.75-2.15 1.02-2.44.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.82 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.3.39-.44.52-.15.15-.3.31-.13.6.17.29.75 1.24 1.62 2 1.12.99 2.06 1.3 2.35 1.45.29.15.46.12.63-.07.17-.2.72-.84.92-1.13.19-.29.39-.24.65-.15.27.1 1.7.8 2 .95.29.15.48.22.55.34.07.13.07.71-.17 1.39Z"/>
          </svg>
        </a>
      </div>
      <div class="gb-share-row">
        <input class="gb-share-url" type="text" readonly value="${pageUrl}">
        <button class="gb-share-copy">Copy</button>
      </div>
    `);

    const copyBtn = document.querySelector(".gb-overlay-backdrop.gb-show .gb-share-copy");
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(pageUrl).then(() => {
        const original = copyBtn.textContent;
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("gb-copied");
        setTimeout(() => {
          copyBtn.textContent = original;
          copyBtn.classList.remove("gb-copied");
        }, 1500);
      });
    });
  }

  /* ---------------------------------------------------------
     5) Attach CONTROLS + SHARE to har jaga jahan bhi buttons hain
     (desktop wale .n151 block + mobile wale .reactions-row block)
     --------------------------------------------------------- */
  document.querySelectorAll(".controls-btn").forEach((btn) => {
    btn.addEventListener("click", showControlsModal);
  });

  document.querySelectorAll(".share-btn").forEach((btn) => {
    btn.addEventListener("click", showShareModal);
  });

  /* ---------------------------------------------------------
     6) REFRESH button — iframe ko reload karega
     --------------------------------------------------------- */
  document.querySelectorAll(".refresh-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Sabse pehle currently visible/active iframe dhoondo
      const iframe =
        document.getElementById("test_app_frame") ||
        document.getElementById("gameFrame");
      if (iframe && iframe.src) {
        const src = iframe.src;
        iframe.src = "";
        // thoda delay taake reload guaranteed ho
        setTimeout(() => (iframe.src = src), 50);
      }
    });
  });

  /* ---------------------------------------------------------
     7) FULLSCREEN button — SIRF desktop wrapper ke liye
     --------------------------------------------------------- */
  document.querySelectorAll(".fullscreen-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = document.getElementById("gameFrameWrapper");
      if (!wrapper) return;

      if (wrapper.requestFullscreen) {
        wrapper.requestFullscreen();
      } else if (wrapper.webkitRequestFullscreen) {
        wrapper.webkitRequestFullscreen();
      } else if (wrapper.msRequestFullscreen) {
        wrapper.msRequestFullscreen();
      }
    });
  });

  /* ---------------------------------------------------------
     8) MOBILE: Play Now -> overlay open, Exit -> iframe auto-pause
     --------------------------------------------------------- */
  const playBtn = document.getElementById("playBtn");
  const gameOverlay = document.getElementById("gameOverlay");
  const closeBtn = document.getElementById("closeBtn");
  const mobileFrame = document.getElementById("gameFrame");

  // Original game URL yaad rakhne ke liye (taake exit ke baad
  // dobara Play kiya jaye to fresh start ho, aur Controls modal
  // ke liye slug bhi mil sake jab src "about:blank" ho jaye)
  const originalGameSrc = mobileFrame ? mobileFrame.getAttribute("src") : null;
  if (mobileFrame && originalGameSrc) {
    mobileFrame.dataset.originalSrc = originalGameSrc;
  }

  if (playBtn && gameOverlay) {
    playBtn.addEventListener("click", () => {
      const needsReload =
        mobileFrame &&
        (!mobileFrame.getAttribute("src") ||
          mobileFrame.getAttribute("src") === "about:blank" ||
          mobileFrame.dataset.needsReload === "1");

      if (needsReload && originalGameSrc) {
        mobileFrame.setAttribute("src", originalGameSrc);
        mobileFrame.dataset.needsReload = "0";
      }
      gameOverlay.classList.add("gb-overlay-open");
      gameOverlay.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  }

  if (closeBtn && gameOverlay) {
    closeBtn.addEventListener("click", () => {
      // Overlay hide karo
      gameOverlay.classList.remove("gb-overlay-open");
      gameOverlay.style.display = "none";
      document.body.style.overflow = "";

      // Game ko "pause/stop" karne ka sabse reliable tareeqa:
      // iframe ka src hata dena (isse embedded game unload ho
      // jata hai aur background me chalna/run hona ruk jata hai).
      if (mobileFrame) {
        mobileFrame.setAttribute("src", "about:blank");
        // taake dobara Play Now click karne par fresh load ho:
        mobileFrame.dataset.needsReload = "1";
      }
    });
  }
})();