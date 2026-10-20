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

/* =====================================================================
   ENTER TRANSITION
   landing fades + blurs away  ->  book pages flip one by one  ->  site
   ===================================================================== */
const PAGES = [
  { title: "Welcome",       sub: "Ryan Jhay Silvestre" },
  { title: "About me",      sub: "Computer Engineering student & developer" },
  { title: "My projects",   sub: "Apps and IoT systems I have built" },
  { title: "Let’s connect", sub: "Let’s build something great together" }
];
const FADE = 600;    // landing fades out / first page fades in
const HOLD = 600;    // first page stays still before the flipping starts
const FLIP = 1400;   // duration of one page turn (bigger = slower flip)
const STEP = 1100;   // delay between two page turns (bigger = longer pause per page)
const tFlip = (i) => FADE + HOLD + i * STEP;               // when page i starts turning
const TOTAL = tFlip(PAGES.length - 1) + FLIP + 60;         // when everything is done

(function injectFlipStyles() {
  const st = document.createElement("style");
  st.textContent = `
    .flip{position:fixed;inset:0;z-index:99999;overflow:hidden;pointer-events:none;
      perspective:2600px;perspective-origin:30% 50%;animation:flipIn ${FADE}ms ease both}

    .flip__page{position:absolute;inset:0;overflow:hidden;color:#fff;
      font-family:"Sora","DM Sans",system-ui,sans-serif;
      transform-origin:left center;backface-visibility:hidden;-webkit-backface-visibility:hidden;
      will-change:transform;
      background:linear-gradient(135deg,#0b2a6b 0%,#081a44 60%,#050f2c 100%);
      box-shadow:inset 22px 0 40px -18px rgba(0,0,0,.55),34px 0 90px rgba(0,0,0,.55);
      animation:flipTurn ${FLIP}ms cubic-bezier(.6,.02,.25,1) both;
      animation-delay:calc(var(--t) * 1ms)}
    .flip__page:nth-child(4n+2){background:linear-gradient(135deg,#123a8f 0%,#0a2250 60%,#061638 100%)}
    .flip__page:nth-child(4n+3){background:linear-gradient(135deg,#1a4fb8 0%,#0d2a66 60%,#071a45 100%)}
    .flip__page:nth-child(4n+4){background:linear-gradient(135deg,#2468e0 0%,#123a8f 60%,#0a2250 100%)}

    .flip__bg{position:absolute;inset:0;
      background:
        radial-gradient(circle at 78% 22%,rgba(91,148,245,.38),transparent 55%),
        radial-gradient(circle at 12% 88%,rgba(36,104,224,.28),transparent 50%),
        radial-gradient(rgba(255,255,255,.09) 1px,transparent 1px);
      background-size:auto,auto,28px 28px}
    .flip__top{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;
      padding:clamp(18px,3vw,34px);font-size:13px;font-weight:600;letter-spacing:.2em;opacity:.75}
    .flip__big{position:absolute;right:3%;bottom:-8%;font-size:clamp(170px,36vw,480px);font-weight:800;
      line-height:1;color:transparent;-webkit-text-stroke:2px rgba(255,255,255,.14);user-select:none}
    .flip__center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;
      justify-content:center;gap:16px;text-align:center;padding:24px}
    .flip__title{font-size:clamp(36px,7.5vw,90px);font-weight:800;line-height:1.05;letter-spacing:-.01em;
      text-shadow:0 8px 40px rgba(0,0,0,.45);
      animation:flipText 700ms cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--r) * 1ms)}
    .flip__rule{width:64px;height:3px;border-radius:3px;background:#8fb0f5;transform-origin:center;
      animation:flipRule 600ms cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--r) * 1ms + 120ms)}
    .flip__sub{font-family:"DM Sans",system-ui,sans-serif;font-size:clamp(14px,2vw,21px);letter-spacing:.04em;
      opacity:.85;animation:flipText 700ms cubic-bezier(.2,.7,.2,1) both;
      animation-delay:calc(var(--r) * 1ms + 200ms)}

    /* shadow cast by the page above, fades away as that page turns */
    .flip__under{position:absolute;inset:0;background:#02060f;pointer-events:none;
      animation:flipUnder ${FLIP}ms ease both;animation-delay:calc(var(--u) * 1ms)}
    /* the page darkens as it turns away from the viewer */
    .flip__dark{position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(90deg,rgba(0,0,0,.05),rgba(0,0,0,.7));
      animation:flipDark ${FLIP}ms ease both;animation-delay:calc(var(--t) * 1ms)}
    /* light sweep across the page while it turns */
    .flip__page::after{content:"";position:absolute;inset:0;pointer-events:none;
      background:linear-gradient(100deg,transparent 35%,rgba(255,255,255,.2) 50%,transparent 65%);
      background-size:300% 100%;background-position:120% 0;
      animation:flipSweep ${FLIP}ms ease both;animation-delay:calc(var(--t) * 1ms)}

    .flip__progress{position:absolute;left:0;bottom:0;height:3px;width:100%;z-index:1000;
      background:linear-gradient(90deg,#5b94f5,#ffffff);transform-origin:left;transform:scaleX(0);
      animation:flipProg ${TOTAL - FADE}ms linear both;animation-delay:${FADE}ms}
    .flip__skip{position:absolute;right:clamp(16px,3vw,32px);bottom:clamp(18px,3vw,32px);z-index:1001;
      pointer-events:auto;cursor:pointer;color:#fff;background:rgba(255,255,255,.1);
      border:1px solid rgba(255,255,255,.28);border-radius:999px;padding:8px 18px;
      font:500 13px "DM Sans",system-ui,sans-serif;letter-spacing:.04em;
      -webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .2s}
    .flip__skip:hover{background:rgba(255,255,255,.22)}

    /* keep the page width stable so nothing jumps when scrolling is unlocked */
    html{scrollbar-gutter:stable}
    /* skip button and progress line fade out before the last page turns */
    .flip.is-ending .flip__skip,.flip.is-ending .flip__progress{
      opacity:0;pointer-events:none;transition:opacity 450ms ease}

    @keyframes flipIn{from{opacity:0}to{opacity:1}}
    @keyframes flipTurn{from{transform:rotateY(0deg)}to{transform:rotateY(-180deg)}}
    @keyframes flipUnder{from{opacity:.6}to{opacity:0}}
    @keyframes flipDark{from{opacity:0}to{opacity:1}}
    @keyframes flipSweep{from{background-position:120% 0}to{background-position:-20% 0}}
    @keyframes flipText{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
    @keyframes flipRule{from{opacity:0;transform:scaleX(0)}to{opacity:1;transform:scaleX(1)}}
    @keyframes flipProg{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  `;
  document.head.appendChild(st);
})();

function burst() {
  enter.disabled = true;
  const timers = [];
  let done = false;

  // 1) landing page fades, blurs and zooms away
  landing.style.transition = `opacity ${FADE}ms ease, transform ${FADE}ms ease, filter ${FADE}ms ease`;
  landing.style.pointerEvents = "none";
  landing.style.opacity = "0";
  landing.style.transform = "scale(1.08)";
  landing.style.filter = "blur(10px)";

  // 2) a stack of pages fades in, then the pages turn one by one
  const flip = document.createElement("div");
  flip.className = "flip";
  const n = PAGES.length;
  PAGES.forEach((pg, i) => {
    const p = document.createElement("div");
    p.className = "flip__page";
    p.style.zIndex = n - i;                                   // first page on top
    p.style.setProperty("--t", tFlip(i));                     // when this page turns
    p.style.setProperty("--u", i > 0 ? tFlip(i - 1) : 0);     // when the page above turns
    p.style.setProperty("--r", i === 0 ? 250 : tFlip(i - 1) + 120); // when its text appears
    p.innerHTML =
      '<div class="flip__bg"></div>' +
      '<div class="flip__top"><span>RJS</span><span class="js-count"></span></div>' +
      '<div class="flip__big"></div>' +
      '<div class="flip__center"><div class="flip__title"></div><div class="flip__rule"></div><div class="flip__sub"></div></div>' +
      (i > 0 ? '<div class="flip__under"></div>' : "") +
      '<div class="flip__dark"></div>';
    p.querySelector(".js-count").textContent = String(i + 1).padStart(2, "0") + " / " + String(n).padStart(2, "0");
    p.querySelector(".flip__big").textContent = String(i + 1).padStart(2, "0");
    p.querySelector(".flip__title").textContent = pg.title;
    p.querySelector(".flip__sub").textContent = pg.sub;
    flip.appendChild(p);
  });
  const prog = document.createElement("div");
  prog.className = "flip__progress";
  flip.appendChild(prog);
  const skip = document.createElement("button");
  skip.type = "button";
  skip.className = "flip__skip";
  skip.textContent = "Skip ›";
  flip.appendChild(skip);
  document.body.appendChild(flip);

  function end() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    flip.remove();
    body.classList.add("site-in");
    finish();
  }
  skip.addEventListener("click", end);

  // 3) the real site is switched on (and scrolled to the top) once the overlay fully covers the screen,
  //    so the last page turns away to reveal a finished, stable page
  timers.push(setTimeout(() => {
    window.scrollTo(0, 0);
    body.classList.add("site-in");
  }, FADE + 50));
  // 4) skip button and progress line fade out before the last page turns
  timers.push(setTimeout(() => flip.classList.add("is-ending"), tFlip(n - 1) - 300));
  // 5) clean up
  timers.push(setTimeout(end, TOTAL));
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
