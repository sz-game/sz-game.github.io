(function () {
      const slider = document.getElementById("gameSlider");
      if (!slider) return;
      const track = slider.querySelector(".game-slider-track");
      const viewport = slider.querySelector(".game-slider-viewport");
      const prev = slider.querySelector(".game-slider-prev");
      const next = slider.querySelector(".game-slider-next");
      const slides = Array.from(track.querySelectorAll(".game-slide"));
      let offset = 0;
      let timer = null;
      let hovered = false;
      let dragging = false;
      let dragStartX = 0;
      let dragStartOffset = 0;
      let dragMoved = 0;

      const step = () => {
        const first = slides[0];
        if (!first) return 0;
        const style = window.getComputedStyle(first);
        return first.getBoundingClientRect().width + parseFloat(style.marginRight || 0) + 12;
      };

      const maxOffset = () => Math.max(0, track.scrollWidth - viewport.clientWidth);

      const update = (animate) => {
        track.style.transition = animate ? "transform 0.3s ease-in-out" : "none";
        track.style.transform = "translateX(-" + offset + "px)";
        prev.style.display = offset > 0 ? "block" : "none";
        next.style.display = offset < maxOffset() - 1 ? "block" : "none";
      };

      const startAuto = () => {
        if (timer) return;
        timer = window.setInterval(() => {
          if (hovered || dragging || document.hidden) return;
          const s = step();
          if (!s) return;
          if (offset + s < maxOffset() + 1) offset += s;
          else offset = 0;
          update(true);
        }, 5000);
      };

      const stopAuto = () => {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
      };

      prev.addEventListener("click", () => {
        offset = Math.max(0, offset - step());
        update(true);
      });

      next.addEventListener("click", () => {
        offset = Math.min(maxOffset(), offset + step());
        update(true);
      });

      slider.addEventListener("mouseenter", () => {
        hovered = true;
        stopAuto();
      });

      slider.addEventListener("mouseleave", () => {
        hovered = false;
        if (!dragging) startAuto();
      });

      track.addEventListener("pointerdown", (e) => {
        dragging = true;
        dragStartX = e.clientX;
        dragStartOffset = offset;
        dragMoved = 0;
        track.style.cursor = "grabbing";
        stopAuto();
      });

      window.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const delta = e.clientX - dragStartX;
        dragMoved = delta;
        offset = Math.min(maxOffset(), Math.max(0, dragStartOffset - delta));
        update(false);
      });

      const endDrag = () => {
        if (!dragging) return;
        dragging = false;
        track.style.cursor = "";
        const threshold = Math.max(50, step() * 0.2);
        if (Math.abs(dragMoved) > threshold) {
          if (dragMoved < 0) offset = Math.min(maxOffset(), offset + step());
          else offset = Math.max(0, offset - step());
        }
        update(true);
        if (!hovered) startAuto();
      };

      window.addEventListener("pointerup", endDrag);
      window.addEventListener("pointercancel", endDrag);
      window.addEventListener("resize", () => {
        offset = Math.min(offset, maxOffset());
        update(false);
      });
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopAuto();
        else if (!hovered && !dragging) startAuto();
      });

      update(false);
      startAuto();
    })();