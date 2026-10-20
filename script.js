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

/* ---------- Enter: landing fades out, pages flip, site appears ---------- */
const FLIP_LABELS = ["Welcome", "About me", "My projects", "Let’s connect"];
const FADE_MS = 600;     // landing fade / first page fade-in
const FLIP_MS = 900;     // one page turn
const STEP_MS = 420;     // delay between page turns

(function injectFlipStyles() {
  const st = document.createElement("style");
  st.textContent = `
    .flip{position:fixed;inset:0;z-index:99999;perspective:2400px;pointer-events:none;
      animation:flipFadeIn ${FADE_MS}ms ease forwards}
    .flip__page{position:absolute;inset:0;transform-origin:left center;backface-visibility:hidden;
      -webkit-backface-visibility:hidden;display:flex;align-items:center;justify-content:center;
      color:#fff;font-family:"Sora","DM Sans",sans-serif;font-weight:700;
      font-size:clamp(28px,6vw,68px);letter-spacing:.02em;text-align:center;padding:24px;
      box-shadow:-30px 0 70px rgba(0,0,0,.4);
      animation:flipTurn ${FLIP_MS}ms cubic-bezier(.65,0,.35,1) forwards;
      animation-delay:calc(var(--i) * ${STEP_MS}ms + ${FADE_MS + 100}ms)}
    .flip__page::after{content:"";position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(90deg,rgba(0,0,0,.35),rgba(255,255,255,.06) 40%,rgba(0,0,0,0));
      animation:flipShade ${FLIP_MS}ms ease forwards;
      animation-delay:calc(var(--i) * ${STEP_MS}ms + ${FADE_MS + 100}ms)}
    .flip__page span{position:relative;z-index:1;text-shadow:0 6px 30px rgba(0,0,0,.45)}
    .flip__page:nth-child(4n+1){background:linear-gradient(135deg,#0b2a6b,#081a44)}
    .flip__page:nth-child(4n+2){background:linear-gradient(135deg,#123a8f,#0a2250)}
    .flip__page:nth-child(4n+3){background:linear-gradient(135deg,#1a4fb8,#0d2a66)}
    .flip__page:nth-child(4n+4){background:linear-gradient(135deg,#2468e0,#123a8f)}
    @keyframes flipFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes flipTurn{from{transform:rotateY(0deg)}to{transform:rotateY(-180deg)}}
    @keyframes flipShade{from{opacity:0}50%{opacity:1}to{opacity:1}}
  `;
  document.head.appendChild(st);
})();

function burst() {
  enter.disabled = true;

  // 1) landing page fades out
  landing.style.transition = `opacity ${FADE_MS}ms ease`;
  landing.style.pointerEvents = "none";
  landing.style.opacity = "0";

  // 2) stack of pages fades in, then flips one by one
  const flip = document.createElement("div");
  flip.className = "flip";
  FLIP_LABELS.forEach((label, i) => {
    const p = document.createElement("div");
    p.className = "flip__page";
    p.style.setProperty("--i", i);
    p.style.zIndex = FLIP_LABELS.length - i;   // first page on top
    p.innerHTML = "<span></span>";
    p.firstChild.textContent = label;
    flip.appendChild(p);
  });
  document.body.appendChild(flip);

  // 3) the real site is revealed under the last page
  body.classList.add("site-in");

  const total = FADE_MS + 100 + (FLIP_LABELS.length - 1) * STEP_MS + FLIP_MS + 80;
  setTimeout(() => {
    flip.remove();
    finish();
  }, total);
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
