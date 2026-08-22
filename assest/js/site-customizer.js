/* ---------------------------------------------------------
   site-customizer.js
   Include this file on EVERY page of the site (in <head>,
   or right before </body>) so the saved favicon/title from
   the Customize page apply everywhere automatically.

   Example:
   <script src="/assets/site-customizer.js"></script>
---------------------------------------------------------- */

(function () {
  const STORAGE_KEY_ICON  = "site_custom_favicon";   // image path/URL
  const STORAGE_KEY_TITLE = "site_custom_title";

  function applyFavicon(value) {
    if (!value || value.trim() === "") return; // Don't apply if empty
    
    const href = value.trim();
    
    // Update ALL favicon links
    document.querySelectorAll("link[rel~='icon']").forEach(link => {
      link.href = href;
    });
    
    // Also update apple-touch-icon
    const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (appleTouchIcon) {
      appleTouchIcon.href = href;
    }
  }

  function applyTitle(value) {
    if (value && value.trim() !== "") {
      document.title = value.trim();
    }
  }

  function init() {
    const savedIcon  = localStorage.getItem(STORAGE_KEY_ICON);
    const savedTitle = localStorage.getItem(STORAGE_KEY_TITLE);
    
    if (savedIcon && savedIcon.trim() !== "") {
      applyFavicon(savedIcon);
    }
    if (savedTitle && savedTitle.trim() !== "") {
      applyTitle(savedTitle);
    }
  }

  // Run as early as possible so the tab doesn't flash the default icon/title
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();