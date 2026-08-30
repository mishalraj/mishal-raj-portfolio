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

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const typeText = async (el, text, speed = 22) => {
  el.textContent = "";
  for (const ch of text) {
    el.textContent += ch;
    await sleep(speed);
  }
};

const playBoot = async () => {
  const boot = document.getElementById("boot");
  const log = document.getElementById("boot-log");
  const finish = () => {
    document.body.classList.remove("is-booting");
    document.body.classList.add("is-ready");
    boot?.classList.add("is-done");
    setTimeout(() => boot?.remove(), 500);
  };

  if (!boot || !log || reduceMotion) {
    finish();
    return;
  }

  try {

  const lines = [
    ["$ systemctl start mishalraj", ""],
    ["[  OK  ] pretence.service", "dim-line"],
    ["[  OK  ] payments.target", "dim-line"],
    ["[  OK  ] hotel-search.service", "dim-line"],
    ["ready.", ""],
  ];

  for (const [text, cls] of lines) {
    const p = document.createElement("p");
    if (cls) p.className = cls;
    log.appendChild(p);
    await typeText(p, text, 14);
    await sleep(70);
  }
    await sleep(240);
  } finally {
    finish();
  }
};

const reveal = () => {
  const nodes = [...document.querySelectorAll(".reveal")];
  const show = (el) => el.classList.add("is-in");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    nodes.forEach(show);
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          show(entry.target);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
  );
  nodes.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) show(el);
    else io.observe(el);
  });
  setTimeout(() => {
    nodes.forEach((el) => {
      if (!el.classList.contains("is-in")) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) show(el);
      }
    });
  }, 700);
};

let termStarted = false;
const playTerm = async () => {
  const root = document.getElementById("term-play");
  if (!root || termStarted) return;
  termStarted = true;
  const typed = [...root.querySelectorAll(".typed")];
  const outs = [...root.querySelectorAll(".out")];
  const caret = root.querySelector(".caret-line");

  const showAll = () => {
    typed.forEach((el) => {
      el.textContent = el.dataset.text || "";
    });
    outs.forEach((el) => el.classList.add("is-shown"));
    caret?.classList.add("is-shown");
    root.classList.add("is-played");
  };

  if (reduceMotion) {
    showAll();
    return;
  }

  for (let i = 0; i < typed.length; i += 1) {
    typed[i].textContent = "";
    await typeText(typed[i], typed[i].dataset.text || "", 26);
    await sleep(120);
    outs[i]?.classList.add("is-shown");
    await sleep(280);
  }
  caret?.classList.add("is-shown");
  root.classList.add("is-played");
};

const watchTerm = () => {
  const root = document.getElementById("term-play");
  if (!root) return;
  if (reduceMotion) {
    playTerm();
    return;
  }
  root.querySelectorAll(".typed").forEach((el) => {
    el.textContent = "";
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          playTerm();
          io.disconnect();
        }
      });
    },
    { threshold: 0.35 }
  );
  io.observe(root);
};

const spyNav = () => {
  const links = [...document.querySelectorAll(".nav a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const sync = () => {
    const y = window.scrollY + 120;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= y) current = section;
    });
    links.forEach((link) => {
      const on = link.getAttribute("href") === `#${current.id}`;
      link.toggleAttribute("aria-current", on);
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
  };

  sync();
  window.addEventListener("scroll", sync, { passive: true });
};

const glitchTitle = () => {
  const title = document.querySelector(".hero h1");
  if (!title || reduceMotion) return;
  const kick = () => {
    title.classList.add("is-glitch");
    setTimeout(() => title.classList.remove("is-glitch"), 400);
  };
  setTimeout(kick, 900);
  setInterval(kick, 9000);
};

playBoot().then(() => {
  reveal();
  watchTerm();
  spyNav();
  glitchTitle();
});
