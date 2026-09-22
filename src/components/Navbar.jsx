import { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Sun, Moon, MapPin } from "lucide-react";
import portraitImg from "../assets/Images/nilu_4x.webp";
import { useTheme } from "../context/ThemeContext";

// ---------------------------------------------------------------------------
// Liquid glass surface — a layered translucent material (blur + saturation +
// a theme-tinted fill + a bright top edge that "catches the light") rather
// than a single flat backdrop-filter. `intensity` (0–1) lets a surface get
// thicker/heavier (more blur, deeper shadow) for bigger elements, per
// Apple's "bigger surfaces read as thicker" material rule.
// ---------------------------------------------------------------------------
function glassSurface(theme, intensity = 0.6, radius = "9999px") {
  const dark = theme === "dark";
  // Real Liquid Glass reads as thick, bright, and slightly warped - that
  // needs a much stronger blur+saturation than a typical "frosted card",
  // plus a real light source (bright top edge, deep bottom edge, a hint of
  // color separation at the rim) rather than one flat translucent fill.
  const blur = 28 + intensity * 20;
  const sat = 180 + intensity * 60;
  return {
    borderRadius: radius,
    color: dark ? "#f5f5f5" : "#0a0a0a",
    background: dark
      ? `linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0) 40%), rgba(20, 20, 24, ${0.46 + intensity * 0.2})`
      : `linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%), rgba(255, 255, 255, ${0.28 + intensity * 0.2})`,
    backdropFilter: `blur(${blur}px) saturate(${sat}%) brightness(${dark ? 1.08 : 1.12}) contrast(1.05)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${sat}%) brightness(${dark ? 1.08 : 1.12}) contrast(1.05)`,
    border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(255,255,255,0.7)",
    boxShadow: dark
      ? [
          "inset 0 1.5px 0 rgba(255,255,255,0.16)",
          "inset 0 -1.5px 0 rgba(0,0,0,0.5)",
          "inset 1px 0 0 rgba(180,150,255,0.08)",
          "inset -1px 0 0 rgba(120,190,255,0.08)",
          `0 ${10 + intensity * 12}px ${28 + intensity * 18}px rgba(0,0,0,0.5)`,
        ].join(", ")
      : [
          "inset 0 1.5px 0 rgba(255,255,255,0.9)",
          "inset 0 -2px 3px rgba(120,170,255,0.16)",
          "inset 1px 0 0 rgba(255,180,220,0.14)",
          "inset -1px 0 0 rgba(160,200,255,0.14)",
          `0 ${10 + intensity * 12}px ${28 + intensity * 18}px rgba(0,0,0,0.12)`,
        ].join(", "),
    transition: "background 0.4s ease, box-shadow 0.4s ease, backdrop-filter 0.4s ease, color 0.4s ease",
  };
}

const SPRING = { type: "spring", stiffness: 300, damping: 28, mass: 0.8 };
const SPRING_SNAPPY = { type: "spring", stiffness: 420, damping: 32, mass: 0.6 };

function ThemeSwitch({ theme, toggleTheme, reduceMotion }) {
  const isDark = theme === "dark";
  return (
    <motion.button
      onClick={toggleTheme}
      whileTap={reduceMotion ? {} : { scale: 0.92 }}
      aria-label="Toggle dark mode"
      aria-pressed={isDark}
      className="relative w-[60px] h-9 rounded-full shrink-0 overflow-hidden"
      style={glassSurface(theme, 0.7)}
    >
      {/* faint context icons on the track */}
      <Sun
        size={12}
        strokeWidth={2.2}
        className="absolute left-2 top-1/2 -translate-y-1/2 text-amber-500 transition-opacity duration-300"
        style={{ opacity: isDark ? 0.25 : 0.55 }}
      />
      <Moon
        size={12}
        strokeWidth={2.2}
        className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-300"
        style={{ opacity: isDark ? 0.7 : 0.2, color: theme === "dark" ? "#e4e4e7" : "#111" }}
      />

      <motion.span
        className="absolute top-1 left-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
        animate={{ x: isDark ? 26 : 0 }}
        transition={reduceMotion ? { duration: 0.15 } : SPRING_SNAPPY}
        style={{
          background: isDark
            ? "linear-gradient(145deg, #52525b, #18181b)"
            : "linear-gradient(145deg, #fff6df, #ffd979)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={theme}
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: reduceMotion ? 0.1 : 0.22 }}
            className="flex items-center justify-center"
          >
            {isDark ? (
              <Moon size={13} strokeWidth={2.3} className="text-zinc-100" />
            ) : (
              <Sun size={13} strokeWidth={2.3} className="text-amber-700" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </motion.button>
  );
}

function AnimatedHamburger({ open, ...props }) {
  return (
    <motion.button
      {...props}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      transition={SPRING_SNAPPY}
      aria-label="Open menu"
      aria-expanded={open}
      className="min-[741px]:hidden flex flex-col justify-center items-center gap-[5px] w-11 h-11 rounded-full shrink-0"
    >
      <motion.span
        animate={{ rotate: open ? 45 : 0, y: open ? 3 : 0 }}
        transition={SPRING_SNAPPY}
        className="w-4 h-0.5 rounded-full bg-black dark:bg-white"
      />
      <motion.span
        animate={{ rotate: open ? -45 : 0, y: open ? -3 : 0 }}
        transition={SPRING_SNAPPY}
        className="w-4 h-0.5 rounded-full bg-black dark:bg-white"
      />
    </motion.button>
  );
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pillHovered, setPillHovered] = useState(false);

  const pillRef = useRef(null);

  // Spring-smoothed cursor position - this is what makes the specular sheen
  // glide behind the pointer instead of snapping straight to it.
  const rawX = useMotionValue(50);
  const rawY = useMotionValue(50);
  const mouseX = useSpring(rawX, { stiffness: 140, damping: 20, mass: 0.4 });
  const mouseY = useSpring(rawY, { stiffness: 140, damping: 20, mass: 0.4 });
  const sheenColor = theme === "dark" ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.75)";
  const highlight = useMotionTemplate`radial-gradient(220px circle at ${mouseX}% ${mouseY}%, ${sheenColor}, transparent 60%)`;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    onScroll(); // sync immediately - covers reload/deep-link mid-page too
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function handlePointerMove(e) {
    const rect = pillRef.current.getBoundingClientRect();
    rawX.set(((e.clientX - rect.left) / rect.width) * 100);
    rawY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  const links = ["Work", "Playground", "About"];
  const emailHref = "mailto:fathimanauhap03@gmail.com";

  const handleMobileNavClick = (link) => {
  setMenuOpen(false);

  const id = link.toLowerCase();
  const element = document.getElementById(id);

  if (!element) return;

  // Scroll to the section
  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

  // Remove the #hash from the URL
  window.history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
};
  // Hovering the compressed/scrolled pill reveals the full nav again -
  // compact by default once scrolled, but never more than a hover away.
  const showFull = !scrolled || pillHovered;
  const showCompactBadge = scrolled && !pillHovered;

  return (
    <>
      <nav className="fixed top-4 left-0 w-full z-40 px-4 flex items-center justify-between">
        {/* Left — location. Visible only near the top; fades out once scrolled
            past the hero, on desktop only. Space stays reserved so nothing
            else in the bar shifts. */}
        <motion.a
          href="/"
          className="hidden lg:flex items-center gap-1.5 text-xs font-mono uppercase tracking-wide text-black dark:text-white"
          animate={
            reduceMotion
              ? { opacity: scrolled ? 0 : 1 }
              : { opacity: scrolled ? 0 : 1, y: scrolled ? -8 : 0, filter: scrolled ? "blur(4px)" : "blur(0px)" }
          }
          transition={SPRING}
          style={{ pointerEvents: scrolled ? "none" : "auto" }}
        >
          <MapPin size={13} strokeWidth={2.2} aria-hidden />
          <span>Kozhikode, IN</span>
        </motion.a>

        {/* Desktop pill — liquid glass, hover-expands with a buttery spring */}
        <motion.div
          ref={pillRef}
          onPointerMove={handlePointerMove}
          onHoverStart={() => setPillHovered(true)}
          onHoverEnd={() => setPillHovered(false)}
          animate={{
            gap: scrolled ? 10 : 16,
            scale: pillHovered && !reduceMotion ? 1.015 : 1,
          }}
          transition={SPRING}
          className="relative hidden min-[741px]:flex mx-auto items-center px-2 py-1.5 overflow-hidden"
          style={glassSurface(theme, scrolled || pillHovered ? 0.85 : 0.55)}
        >
          {/* Static rim light - a fixed "catch light" at the top edge, the
              way a real curved glass surface reflects an overhead light
              regardless of where the cursor is. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                theme === "dark"
                  ? "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 55%)"
                  : "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 55%)",
              mixBlendMode: "screen",
            }}
          />

          {/* Dynamic sheen - follows the pointer with a spring, like light
              refracting through the glass as it moves. */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: highlight, mixBlendMode: theme === "dark" ? "overlay" : "soft-light" }}
            animate={{ opacity: pillHovered ? 1 : 0.5 }}
            transition={{ duration: 0.3 }}
          />

          <motion.a
            href="/"
            whileHover={reduceMotion ? {} : { scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            transition={SPRING_SNAPPY}
            className="relative z-10 w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/60"
          >
            <img src={portraitImg} alt="Nauha's photo" className="w-full h-full object-cover" />
          </motion.a>

          <div
            className="relative z-10 flex items-center gap-2 overflow-hidden whitespace-nowrap"
            style={{
              opacity: showCompactBadge ? 1 : 0,
              maxWidth: showCompactBadge ? "220px" : "0px",
              transitionProperty: "max-width, opacity",
              transitionDuration: "450ms, 250ms",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1), ease",
              transitionDelay: showCompactBadge ? "0.05s, 0.05s" : "0s, 0s",
            }}
          >
            <span className="text-sm font-normal">Available for work</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>

          {/* Full nav - always shown while at the top; while scrolled it's
              compacted away, but hovering the pill reveals it again instead
              of forcing a click to get back to the links. */}
          <div
            className="relative z-10 flex items-center gap-1 overflow-hidden whitespace-nowrap"
            style={{
              opacity: showFull ? 1 : 0,
              maxWidth: showFull ? "500px" : "0px",
              transitionProperty: "max-width, opacity",
              transitionDuration: "450ms, 200ms",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1), ease",
              transitionDelay: showFull ? "0.05s, 0.05s" : "0s, 0s",
            }}
          >
            {links.map((link) => (
              <motion.a
                key={link}
                href={`#${link.toLowerCase()}`}
                whileHover={reduceMotion ? {} : { scale: 1.06 }}
                whileTap={{ scale: 0.96 }}
                transition={SPRING_SNAPPY}
                className="inline-block px-3 py-1.5 text-sm font-normal rounded-full border border-transparent hover:border-white/60 hover:bg-white/10 transition-colors"
              >
                {link}
              </motion.a>
            ))}

            <motion.a
              href={emailHref}
              whileHover={reduceMotion ? {} : { scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={SPRING_SNAPPY}
              className="flex items-center gap-1.5 bg-white text-black text-sm font-normal px-4 py-2 rounded-full shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" aria-hidden>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              Work with me
            </motion.a>
          </div>
        </motion.div>

        {/* Mobile hamburger — glass surface, morphing bars */}
        <AnimatedHamburger open={menuOpen} onClick={() => setMenuOpen(true)} style={glassSurface(theme, 0.55)} />

        {/* Right — advanced sliding theme switch */}
        <ThemeSwitch theme={theme} toggleTheme={toggleTheme} reduceMotion={reduceMotion} />
      </nav>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={reduceMotion ? { duration: 0.15 } : { type: "spring", damping: 26, stiffness: 240 }}
            className="fixed inset-0 z-50 flex flex-col justify-center px-8"
            style={{
              background: theme === "dark" ? "rgba(17,17,17,0.82)" : "rgba(250,246,239,0.82)",
              backdropFilter: "blur(40px) saturate(200%) brightness(1.05)",
              WebkitBackdropFilter: "blur(40px) saturate(200%) brightness(1.05)",
            }}
          >
            <motion.button
              onClick={() => setMenuOpen(false)}
              whileTap={{ scale: 0.92 }}
              className="absolute top-6 left-6 text-sm text-black dark:text-white px-3 py-1.5 rounded-full"
              style={glassSurface(theme, 0.5)}
              aria-label="Close menu"
            >
              Close
            </motion.button>

            <div className="flex flex-col gap-6">
              {links.map((link, i) => (
                <div key={link} className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-black/40 dark:text-white/40">0{i + 1}</span>
                  <motion.a
  href={`#${link.toLowerCase()}`}
  onClick={(e) => {
    e.preventDefault();
    handleMobileNavClick(link);
  }}
  whileHover={reduceMotion ? {} : { x: 8 }}
  whileTap={{ scale: 0.97 }}
  transition={SPRING}
  className="font-serif text-5xl text-black dark:text-white"
>
  {link}
</motion.a>
                </div>
              ))}

              <div className="flex items-baseline gap-3">
                <span className="text-xs font-mono text-black/40 dark:text-white/40">0{links.length + 1}</span>
                <motion.a
                  href={emailHref}
                  onClick={() => setMenuOpen(false)}
                  whileHover={reduceMotion ? {} : { x: 8 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                  className="font-serif text-5xl text-black dark:text-white"
                >
                  Work with me
                </motion.a>
              </div>
            </div>

            <a
              href="/"
              className="absolute bottom-6 left-6 flex items-center gap-1.5 text-xs font-mono uppercase text-black/60 dark:text-white/60"
            >
              <MapPin size={12} strokeWidth={2.2} aria-hidden />
              Kozhikode, IN
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Graceful fallback for reduced-transparency / high-contrast users:
          drop the blur, raise opacity to near-solid, per Apple's a11y guidance. */}
      <style>{`
        @media (prefers-reduced-transparency: reduce) {
          [style*="backdrop-filter"] {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: ${theme === "dark" ? "rgba(20,20,22,0.96)" : "rgba(255,255,255,0.96)"} !important;
          }
        }
        @media (prefers-contrast: more) {
          [style*="backdrop-filter"] {
            border-width: 1.5px !important;
            border-color: ${theme === "dark" ? "#fff" : "#000"} !important;
          }
        }
      `}</style>
    </>
  );
}