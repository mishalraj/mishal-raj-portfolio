const clock = document.getElementById("clock");
const scrollPct = document.getElementById("scroll-pct");
const palette = document.getElementById("palette");
const paletteInput = document.getElementById("palette-input");
const paletteList = document.getElementById("palette-list");

const kolkata = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

const tick = () => {
  if (!clock) return;
  const value = kolkata();
  clock.textContent = value;
  clock.setAttribute("datetime", new Date().toISOString());
};

tick();
setInterval(tick, 1000);

const onScroll = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / max) * 100));
  if (scrollPct) scrollPct.textContent = `${pct}%`;
};

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

document.querySelectorAll(".log-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.closest(".log-item");
    const open = item.hasAttribute("data-open");
    if (open) {
      item.removeAttribute("data-open");
      button.setAttribute("aria-expanded", "false");
    } else {
      item.setAttribute("data-open", "");
      button.setAttribute("aria-expanded", "true");
    }
  });
});

const formatCount = (value) => {
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return String(Math.round(value));
};

let counted = false;
const animateCounts = () => {
  if (counted) return;
  counted = true;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? "";
    if (reduce || !target) {
      el.textContent = `${formatCount(target)}${suffix}`;
      return;
    }
    const start = performance.now();
    const duration = 900;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = `${formatCount(target * eased)}${suffix}`;
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
};

if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounts();
          io.disconnect();
        }
      });
    },
    { threshold: 0.15 }
  );
  const metrics = document.querySelector(".metrics");
  if (metrics) io.observe(metrics);
}
window.addEventListener("load", () => setTimeout(animateCounts, 200));

const buttons = [...paletteList.querySelectorAll("button")];
let active = 0;

const setActive = (index) => {
  active = (index + buttons.length) % buttons.length;
  paletteList.querySelectorAll("li").forEach((li, i) => {
    li.toggleAttribute("data-active", i === active);
  });
};

const openPalette = () => {
  palette.hidden = false;
  paletteInput.value = "";
  filterPalette("");
  setActive(0);
  paletteInput.focus();
};

const closePalette = () => {
  palette.hidden = true;
};

const filterPalette = (query) => {
  const q = query.trim().toLowerCase();
  buttons.forEach((button) => {
    const show = button.textContent.toLowerCase().includes(q);
    button.parentElement.hidden = !show;
  });
  const visible = buttons.filter((b) => !b.parentElement.hidden);
  if (visible.length) setActive(buttons.indexOf(visible[0]));
};

const go = (href) => {
  closePalette();
  const target = document.querySelector(href);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
};

paletteInput.addEventListener("input", (e) => filterPalette(e.target.value));

paletteList.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (button) go(button.dataset.href);
});

palette.addEventListener("click", (e) => {
  if (e.target === palette) closePalette();
});

document.addEventListener("keydown", (e) => {
  const typing =
    e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;

  if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !typing) {
    e.preventDefault();
    if (palette.hidden) openPalette();
    else closePalette();
    return;
  }

  if (palette.hidden) return;

  if (e.key === "Escape") {
    closePalette();
    return;
  }

  const visible = buttons.filter((b) => !b.parentElement.hidden);
  if (!visible.length) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    const i = visible.indexOf(buttons[active]);
    setActive(buttons.indexOf(visible[(i + 1) % visible.length]));
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    const i = visible.indexOf(buttons[active]);
    setActive(buttons.indexOf(visible[(i - 1 + visible.length) % visible.length]));
  }
  if (e.key === "Enter") {
    e.preventDefault();
    go(buttons[active].dataset.href);
  }
});
