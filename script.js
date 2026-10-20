const body = document.body;
const landing = document.getElementById("landing");
const enter = document.getElementById("enter");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover)").matches;

body.classList.add("has-landing", "locked");

function finish() {
  landing.hidden = true;
  body.classList.remove("locked");
  window.scrollTo(0, 0);
  initReveal();
}

/* ---------- Spark particles (canvas) ---------- */
function sparks(x, y) {
  const cv = document.createElement("canvas");
  cv.className = "spark-canvas";
  const dpr = window.devicePixelRatio || 1;
  cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  ctx.scale(dpr, dpr);
  const colors = ["#ffffff", "#cfe0ff", "#8fb0f5", "#2468e0", "#5b94f5"];
  const ps = Array.from({ length: 110 }, () => {
    const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 15;
    return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, w: 1.5 + Math.random() * 3.5,
             life: 45 + Math.random() * 50, c: colors[(Math.random() * colors.length) | 0] };
  });
  let f = 0;
  (function tick() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    let alive = 0;
    for (const p of ps) {
      if (f > p.life) continue;
      alive++;
      p.vx *= 0.975; p.vy = p.vy * 0.975 + 0.18;
      ctx.globalAlpha = Math.max(0, 1 - f / p.life);
      ctx.strokeStyle = p.c; ctx.lineWidth = p.w; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      p.x += p.vx; p.y += p.vy;
      ctx.lineTo(p.x - p.vx * 1.6, p.y - p.vy * 1.6); ctx.stroke();
    }
    f++;
    if (alive) requestAnimationFrame(tick); else cv.remove();
  })();
}

/* ---------- Enter: flash, shockwaves, shatter, zoom-through ---------- */
function burst(e) {
  const r = enter.getBoundingClientRect();
  const x = e.clientX || r.left + r.width / 2;
  const y = e.clientY || r.top + r.height / 2;
  const W = innerWidth, H = innerHeight, reach = Math.max(W, H) * 0.9;
  enter.disabled = true;

  // shards: triangles from the click point out to the screen edge
  const edge = [[0,0],[W/2,0],[W,0],[W,H/2],[W,H],[W/2,H],[0,H],[0,H/2]];
  const shards = document.createElement("div");
  shards.className = "shards";
  edge.forEach((p, i) => {
    const q = edge[(i + 1) % edge.length];
    const s = document.createElement("div");
    s.className = "shard";
    s.style.clipPath = `polygon(${x}px ${y}px, ${p[0]}px ${p[1]}px, ${q[0]}px ${q[1]}px)`;
    s.style.transformOrigin = `${(x + p[0] + q[0]) / 3}px ${(y + p[1] + q[1]) / 3}px`;
    const mx = (p[0] + q[0]) / 2 - x, my = (p[1] + q[1]) / 2 - y, len = Math.hypot(mx, my) || 1;
    s.style.setProperty("--dx", (mx / len) * reach + "px");
    s.style.setProperty("--dy", (my / len) * reach + "px");
    s.style.setProperty("--rot", (i % 2 ? 1 : -1) * (12 + i * 3) + "deg");
    s.style.animationDelay = i * 22 + "ms";
    shards.appendChild(s);
  });
  landing.prepend(shards);

  // flash + two shockwaves
  [["flash", 0], ["shock", 0], ["shock", 140]].forEach(([cls, delay]) => {
    const d = document.createElement("div");
    d.className = cls;
    d.style.left = x + "px"; d.style.top = y + "px";
    d.style.animationDelay = delay + "ms";
    landing.appendChild(d);
  });

  landing.classList.add("is-bursting");
  body.classList.add("site-in");
  sparks(x, y);
  setTimeout(finish, 1350);
}

if (location.hash || reduce) {
  body.classList.add("site-in");
  finish();
} else {
  enter.focus({ preventScroll: true });
  enter.addEventListener("click", burst);
}

/* ---------- Scroll reveal, staggered ---------- */
function initReveal() {
  if (reduce || !("IntersectionObserver" in window)) return;
  const sel = ".section-head, .about > h2, .about__body > *, .card, .skill-groups > div, .project, .steps li, .contact .photo-frame, .contact__text";
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      el.addEventListener("animationend", () => el.classList.remove("reveal", "in"), { once: true });
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(sel).forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.matches(sel));
    el.style.setProperty("--d", sibs.indexOf(el) * 0.08 + "s");
    el.classList.add("reveal");
    io.observe(el);
  });
}

/* ---------- Card spotlight + phone tilt ---------- */
if (canHover && !reduce) {
  document.querySelectorAll(".card").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - r.left + "px");
      c.style.setProperty("--my", e.clientY - r.top + "px");
    });
    c.addEventListener("pointerleave", () => { c.style.removeProperty("--mx"); c.style.removeProperty("--my"); });
  });
  document.querySelectorAll(".project").forEach((p) => {
    const s = p.querySelector(".project__shot");
    p.addEventListener("pointermove", (e) => {
      const r = s.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      s.style.transform = `perspective(700px) rotateY(${px * 14}deg) rotateX(${-py * 10}deg) translateY(-6px)`;
    });
    p.addEventListener("pointerleave", () => { s.style.transform = ""; });
  });
}

/* ---------- Scroll progress bar ---------- */
const bar = document.getElementById("progress");
function progress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
}
addEventListener("scroll", progress, { passive: true });

/* ---------- Basics ---------- */
document.getElementById("year").textContent = new Date().getFullYear();
document.querySelectorAll(".project__shot img").forEach((img) => {
  img.addEventListener("error", () => { img.style.display = "none"; });
});
const toggle = document.querySelector(".nav__toggle");
const menu = document.getElementById("menu");
toggle.addEventListener("click", () => {
  const open = menu.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
});

/* ---------- Email: open the composer directly, message pre-filled ---------- */
const MAIL = {
  to: "silvestreryanjhay@gmail.com",
  subject: 'Project inquiry from your portfolio',
  body: "Hi Ryan,\n\nI saw your portfolio and I'd like to talk about a project.\n\nMy name:\nWhat I need help with:\n\nThanks!".replace(/\\n/g, "\n")
};
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.matchMedia("(pointer: coarse)").matches;
document.querySelectorAll("[data-compose]").forEach((a) => {
  a.addEventListener("click", (e) => {
    if (isMobile) return;               // phones: the normal mailto opens the mail app
    e.preventDefault();                 // desktop: open Gmail compose in a new tab
    const url = "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(MAIL.to) +
      "&su=" + encodeURIComponent(MAIL.subject) +
      "&body=" + encodeURIComponent(MAIL.body);
    window.open(url, "_blank", "noopener");
  });
});