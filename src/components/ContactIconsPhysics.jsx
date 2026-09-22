import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MessageCircle, FileText, Copy, Check, Link2, X } from "lucide-react";

// Bug fix (kept from the previous pass): these three custom SVGs spread
// `{...props}` straight onto <svg>, but `size={20}` isn't a real SVG
// attribute - only `width`/`height` are. Destructuring `size` and mapping it
// to width/height (the way lucide-react's own icons do internally) is what
// actually fixed the "icons not loading" symptom.
function LinkedinIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="11" x2="8" y2="17" />
      <circle cx="8" cy="7.2" r="0.4" fill="currentColor" />
      <path d="M12 17v-3.5c0-1.4 1-2.3 2.2-2.3s2 .9 2 2.3V17" />
      <line x1="12" y1="11" x2="12" y2="17" />
    </svg>
  );
}

function InstagramIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="0.6" fill="currentColor" />
    </svg>
  );
}

function GithubIcon({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 2a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 015 0c1.9-1.29 2.74-1.02 2.74-1.02.56 1.38.21 2.4.1 2.65.65.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .26.18.57.69.48A10 10 0 0012 2z" />
    </svg>
  );
}

const icons = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/fathima-nauha-p-545a27275/", Icon: LinkedinIcon },
  { label: "Instagram", href: "https://instagram.com/niiluuhh", Icon: InstagramIcon },
  { label: "GitHub", href: "https://github.com/YOUR-HANDLE", Icon: GithubIcon },
  { label: "WhatsApp", href: "https://wa.me/7736964015", Icon: MessageCircle },
  { label: "Resume", href: "/Resume_Nauha.pdf", Icon: FileText },
];

const CONTACT_EMAIL = "fathimanauhap03@gmail.com";
const CHIP_SIZE = 60;
const FLOOR_INSET = 22; // keeps resting icons off the card's rounded bottom edge
const DRAG_THRESHOLD = 6; // px of movement that separates "a click" from "a drag"

// Fixed, theme-independent card palette. Per your last note: the box itself
// (background, text, chips, button) should look identical in light and dark
// mode - only the page around it gets darker. So none of these are ternaries
// anymore; they're just constants.
const CARD_BG = "#f2f2f0";
const CARD_BORDER = "1px solid rgba(0,0,0,0.05)";
const CHIP_BG = "#ffffff";
const CHIP_BORDER = "1px solid rgba(0,0,0,0.08)";
const CHIP_BORDER_ACTIVE = "rgba(0,0,0,0.3)";
const CHIP_TEXT = "#111111";

export default function ContactSection() {
  const stageRef = useRef(null);
  const cardRef = useRef(null);
  const bodiesRef = useRef([]);
  const elsRef = useRef([]);
  const zCounterRef = useRef(1);
  const dragRef = useRef({ active: null, pointerId: null, lastPos: null, startPos: null, lastTime: 0, vx: 0, vy: 0, movedDist: 0 });
  const [copied, setCopied] = useState(false);
  const reduceMotion = useReducedMotion();
  // Chips stay invisible and inert until the card actually scrolls into
  // view - confirmed against muhid.de directly: its icons sit at opacity:0
  // on load and only fall in once, the first time the card crosses into the
  // viewport. It doesn't replay on scrolling away and back, and settled
  // icons don't respond to scroll position at all (checked that live too).
  const [started, setStarted] = useState(false);

  // A second, always-reliable way to reach every link with one click - not
  // a replacement for the falling chips, an addition. Good for anyone who
  // doesn't want to chase/drag a chip, and for keyboard/screen-reader users
  // who can't meaningfully interact with the physics stage at all.
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuBtnRef = useRef(null);

  function handleCopyEmail() {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }

  // One-shot viewport trigger - disconnects itself the first time the card
  // is meaningfully on screen, so the fall never replays later.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    if (reduceMotion) {
      setStarted(true);
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // dt-based physics ported from the marquee-to-physics component: real
  // elapsed time per frame instead of a fixed increment, so fall speed and
  // drag feel are identical on a 60Hz laptop and a 120Hz phone.
  useEffect(() => {
    if (!started) return;
    if (reduceMotion) {
      // Static, accessible fallback: lay the chips out in a plain row
      // immediately, no falling motion at all.
      const stage = stageRef.current;
      if (stage) {
        const W = stage.clientWidth || 300;
        const gap = 14;
        const totalW = icons.length * CHIP_SIZE + (icons.length - 1) * gap;
        let x = Math.max(0, (W - totalW) / 2);
        icons.forEach((_, i) => {
          const el = elsRef.current[i];
          if (el) el.style.transform = `translate3d(${x}px, ${stage.clientHeight - CHIP_SIZE - FLOOR_INSET}px, 0)`;
          x += CHIP_SIZE + gap;
        });
      }
      return;
    }

    let cancelled = false;
    let rafId;
    let lastTs = null;

    function tryInit() {
      if (cancelled) return;
      const stage = stageRef.current;
      if (!stage || stage.clientWidth === 0 || stage.clientHeight === 0) {
        rafId = requestAnimationFrame(tryInit);
        return;
      }
      const W = stage.clientWidth;

      bodiesRef.current = icons.map((ic, i) => ({
        ...ic,
        x: 10 + Math.random() * Math.max(1, W - (CHIP_SIZE + 20)),
        y: -60 - i * 55,
        vx: (Math.random() - 0.5) * 0.6,
        vy: 0,
        angle: (Math.random() - 0.5) * 30,
        angularVel: (Math.random() - 0.5) * 2,
        size: CHIP_SIZE,
        dragging: false,
        hovering: false,
        z: i + 1,
      }));
      zCounterRef.current = bodiesRef.current.length + 1;

      const GRAVITY = 0.22;
      const MAX_FALL_SPEED = 13;
      const FRICTION = 0.985;
      const ANGULAR_FRICTION = 0.96;
      const REST = 0.3;

      function step(ts) {
        if (lastTs == null) lastTs = ts;
        const dt = Math.min((ts - lastTs) / (1000 / 60), 3);
        lastTs = ts;

        const w = stage.clientWidth;
        const h = stage.clientHeight;
        const floor = h - FLOOR_INSET;
        const list = bodiesRef.current;

        list.forEach((b) => {
          if (b.dragging) return;
          b.vy = Math.min(b.vy + GRAVITY * dt, MAX_FALL_SPEED);
          b.vx *= Math.pow(FRICTION, dt);
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.angle += b.angularVel * dt;
          b.angularVel *= Math.pow(ANGULAR_FRICTION, dt);

          if (b.y + b.size > floor) {
            b.y = floor - b.size;
            b.vy = -Math.abs(b.vy) * REST;
            b.angularVel += (Math.random() - 0.5) * 1.2;
            if (Math.abs(b.vy) < 0.6) b.vy = 0;
          }
          if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx) * REST; }
          if (b.x + b.size > w) { b.x = w - b.size; b.vx = -Math.abs(b.vx) * REST; }
        });

        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j];
            const dx = (b.x + b.size / 2) - (a.x + a.size / 2);
            const dy = (b.y + b.size / 2) - (a.y + a.size / 2);
            const dist = Math.hypot(dx, dy) || 1;
            const minDist = (a.size + b.size) / 2;
            if (dist < minDist) {
              const overlap = Math.min(((minDist - dist) / 2) * 0.2 * dt, 1.5);
              const nx = dx / dist, ny = dy / dist;
              if (!a.dragging) { a.x -= nx * overlap; a.y -= ny * overlap; }
              if (!b.dragging) { b.x += nx * overlap; b.y += ny * overlap; }
            }
          }
        }

        list.forEach((b, i) => {
          const el = elsRef.current[i];
          if (!el) return;
          const active = b.dragging || b.hovering;
          const scale = active ? 1.18 : 1;
          el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.angle}deg) scale(${scale})`;
          el.style.zIndex = b.z;
          el.style.boxShadow = active ? "0 10px 24px rgba(0,0,0,0.22)" : "0 3px 10px rgba(0,0,0,0.08)";
          el.style.borderColor = active ? CHIP_BORDER_ACTIVE : "rgba(0,0,0,0.08)";
        });

        rafId = requestAnimationFrame(step);
      }
      rafId = requestAnimationFrame(step);
    }
    tryInit();
    return () => { cancelled = true; cancelAnimationFrame(rafId); };
  }, [started, reduceMotion]);

  const getPoint = useCallback((e) => {
    const rect = stageRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  // --- Drag, rebuilt on native Pointer Events -------------------------------
  // The "sticks to the cursor, even after release" bug had two real causes:
  //
  // 1. `<a href>` elements are natively draggable in every desktop browser -
  //    without `draggable={false}`, mousedown on a link can kick off the
  //    browser's own HTML5 drag-and-drop (the translucent "ghost" you can
  //    drag to a new tab or the bookmarks bar) AT THE SAME TIME as our own
  //    JS-driven movement. Two drags running on the same element is exactly
  //    what a "sticky/ghosting" feel looks like, and the native one doesn't
  //    clean up on the same mouseup our code listens for.
  // 2. The old code tracked the drag with a plain
  //    `window.addEventListener("mouseup", ...)`. That only fires if the
  //    button is released while the pointer is still over the page - if you
  //    release slightly outside the window, over dev tools, or after the tab
  //    loses focus, the listener never runs and `dragRef.current.active`
  //    stays set forever, so the chip keeps following every later
  //    mousemove. That's "release also sticking."
  //
  // Both are fixed here: `draggable={false}` below kills the native drag
  // entirely, and switching to Pointer Events + `setPointerCapture` makes
  // the browser guarantee this element keeps receiving pointermove/up/cancel
  // for that pointer no matter where it travels - release can't be missed.
  // A `blur`/`visibilitychange` safety net covers the one remaining edge
  // case (alt-tabbing mid-drag).
  const onPointerDown = useCallback((e, index) => {
    if (!started) return;
    if (e.button !== undefined && e.button !== 0) return; // primary button/touch only
    const body = bodiesRef.current[index];
    if (!body) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    body.dragging = true;
    body.hovering = true;
    zCounterRef.current += 1;
    body.z = zCounterRef.current;
    const p = getPoint(e);
    dragRef.current.active = body;
    dragRef.current.pointerId = e.pointerId;
    dragRef.current.lastPos = p;
    dragRef.current.startPos = p;
    dragRef.current.lastTime = performance.now();
    dragRef.current.movedDist = 0;
  }, [getPoint, started]);

  const onPointerMove = useCallback((e) => {
    const body = dragRef.current.active;
    if (!body || e.pointerId !== dragRef.current.pointerId) return;
    if (e.cancelable) e.preventDefault();
    const p = getPoint(e);
    const now = performance.now();
    const dt = Math.max(now - dragRef.current.lastTime, 1);
    dragRef.current.vx = dragRef.current.vx * 0.5 + ((p.x - dragRef.current.lastPos.x) / dt * 18) * 0.5;
    dragRef.current.vy = dragRef.current.vy * 0.5 + ((p.y - dragRef.current.lastPos.y) / dt * 18) * 0.5;
    body.x = p.x - body.size / 2;
    body.y = p.y - body.size / 2;
    dragRef.current.movedDist = Math.hypot(p.x - dragRef.current.startPos.x, p.y - dragRef.current.startPos.y);
    dragRef.current.lastPos = p;
    dragRef.current.lastTime = now;
  }, [getPoint]);

  const releaseActiveBody = useCallback((e) => {
    const body = dragRef.current.active;
    if (!body) return;
    if (e && e.pointerId !== undefined && e.pointerId !== dragRef.current.pointerId) return;
    body.dragging = false;
    body.hovering = false;
    body.vx = dragRef.current.vx;
    body.vy = dragRef.current.vy;
    body.angularVel = dragRef.current.vx * 0.5;
    dragRef.current.active = null;
    dragRef.current.pointerId = null;
    dragRef.current.vx = 0;
    dragRef.current.vy = 0;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", releaseActiveBody);
    window.addEventListener("pointercancel", releaseActiveBody);
    window.addEventListener("blur", releaseActiveBody);
    document.addEventListener("visibilitychange", releaseActiveBody);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", releaseActiveBody);
      window.removeEventListener("pointercancel", releaseActiveBody);
      window.removeEventListener("blur", releaseActiveBody);
      document.removeEventListener("visibilitychange", releaseActiveBody);
    };
  }, [onPointerMove, releaseActiveBody]);

  // Movement-distance decides click vs. drag (matches muhid.de exactly,
  // confirmed live): under the threshold, the native anchor click is left
  // alone and navigates; at or above it, the click is suppressed because the
  // gesture was clearly a drag-and-release.
  const onChipClick = useCallback((e) => {
    if (dragRef.current.movedDist > DRAG_THRESHOLD) e.preventDefault();
  }, []);

  // Quick-links menu: closes on outside click or Escape. A control that
  // traps you open is the opposite of what Apple's design guidance calls
  // "interruptibility" - every interaction needs an easy, obvious way out.
  useEffect(() => {
    if (!menuOpen) return;
    function onDocPointerDown(e) {
      if (menuRef.current?.contains(e.target) || menuBtnRef.current?.contains(e.target)) return;
      setMenuOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onDocPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="relative px-4 py-16 transition-colors duration-500 bg-white dark:bg-neutral-950">
      <div
        ref={cardRef}
        className="relative rounded-3xl px-6 py-10 sm:py-14 text-center max-w-3xl mx-auto"
        style={{ background: CARD_BG, border: CARD_BORDER }}
      >
        {/* Quick-links toggle: a guaranteed one-click path to every link,
            alongside the falling chips rather than instead of them. Its own
            colors DO follow the site theme (dark:), since it's a floating
            control on top of the fixed-light card, not part of the box. */}
        <div className="absolute top-4 right-4 z-30">
          <motion.button
            ref={menuBtnRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="contact-quick-links"
            aria-label={menuOpen ? "Close quick links" : "Open quick links"}
            whileTap={reduceMotion ? {} : { scale: 0.92 }}
            whileHover={reduceMotion ? {} : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 420, damping: 30 }}
            className="grid place-items-center w-10 h-10 sm:w-11 sm:h-11 rounded-full shadow-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
          >
            <motion.span
              animate={{ rotate: menuOpen ? 45 : 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="grid place-items-center"
            >
              {menuOpen ? <X size={18} strokeWidth={2} /> : <Link2 size={16} strokeWidth={2} />}
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                ref={menuRef}
                id="contact-quick-links"
                role="menu"
                aria-label="Contact links"
                initial={{ opacity: 0, scale: 0.92, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
                className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl shadow-2xl
                           bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl
                           border border-black/[0.06] dark:border-white/10"
              >
                {icons.map((ic, i) => (
                  <motion.a
                    key={ic.label}
                    role="menuitem"
                    href={ic.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduceMotion ? 0 : i * 0.035, type: "spring", stiffness: 400, damping: 32 }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium
                               text-neutral-900 dark:text-white
                               hover:bg-black/[0.04] dark:hover:bg-white/10
                               active:bg-black/[0.07] dark:active:bg-white/15 transition-colors"
                  >
                    <span className="grid place-items-center w-7 h-7 rounded-full bg-black/[0.06] dark:bg-white/10">
                      <ic.Icon size={15} strokeWidth={1.8} />
                    </span>
                    {ic.label}
                  </motion.a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative z-10">
          <h2 className="font-display text-xl sm:text-2xl font-semibold mb-6" style={{ color: CHIP_TEXT }}>
            Looking for the right <span className="italic font-thin-serif">project</span> to build.
          </h2>

          {/* Copy-to-clipboard email, with a visible affordance + confirmation */}
          <button
            onClick={handleCopyEmail}
            aria-label={copied ? "Email copied" : `Copy email address ${CONTACT_EMAIL}`}
            className="relative inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-transform duration-150 hover:scale-[1.03] active:scale-[0.97]"
            style={{ background: "#fff", color: "#111", border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {CONTACT_EMAIL}
            <span className="grid place-items-center w-4 h-4 shrink-0">
              {copied ? <Check size={15} strokeWidth={2.3} /> : <Copy size={14} strokeWidth={2} className="opacity-60" />}
            </span>
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Email address copied to clipboard" : ""}
          </span>

          {/* Invisible spacer - reserves the resting room for the icons below
              the button so the card has the right height; the actual chips
              live in the full-card stage layered behind this content. */}
          <div className="mt-8 h-[220px] sm:h-[110px] w-full" aria-hidden="true" />
        </div>

        {/* Physics stage - `overflow-hidden` now lives here (not on the card
            itself), so falling chips are still clipped to the card's rounded
            shape while the quick-links panel above is free to sit slightly
            outside strict card bounds without being cut off. */}
        <div
          ref={stageRef}
          aria-label="Draggable contact links"
          className="absolute inset-0 z-20 rounded-3xl overflow-hidden pointer-events-none"
        >
          {icons.map((ic, i) => (
            <a
              key={ic.label}
              href={ic.href}
              target="_blank"
              rel="noopener noreferrer"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              ref={(el) => { elsRef.current[i] = el; }}
              onPointerDown={(e) => onPointerDown(e, i)}
              onMouseEnter={() => { if (bodiesRef.current[i]) bodiesRef.current[i].hovering = true; }}
              onMouseLeave={() => {
                if (bodiesRef.current[i] && dragRef.current.active !== bodiesRef.current[i]) {
                  bodiesRef.current[i].hovering = false;
                }
              }}
              onClick={onChipClick}
              aria-label={ic.label}
              title={ic.label}
              className="absolute top-0 left-0 rounded-full flex items-center justify-center select-none cursor-grab active:cursor-grabbing pointer-events-auto"
              style={{
                width: CHIP_SIZE,
                height: CHIP_SIZE,
                touchAction: "none",
                opacity: started ? 1 : 0,
                pointerEvents: started ? "auto" : "none",
                background: CHIP_BG,
                border: CHIP_BORDER,
                color: CHIP_TEXT,
                boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                transition: "box-shadow 0.15s ease, border-color 0.15s ease",
                willChange: "transform",
              }}
            >
              <ic.Icon size={22} strokeWidth={1.8} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}