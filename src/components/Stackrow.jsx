import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// lucide-react dropped brand/logo icons a while back, and this project has
// no react-icons install - so each real logo below is a small hand-drawn
// inline SVG (same technique already used for the contact-icons section),
// not a Lucide stand-in. Six tools, matched to her actual CV/stack, same
// count as before.

function WordPressIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zM3.5 12a8.5 8.5 0 014.4-7.44l3.6 9.86-2 5.6A8.5 8.5 0 013.5 12zm8.5 8.5c-.75 0-1.47-.1-2.15-.3l2.28-6.62 2.34 6.4a.6.6 0 00.1.16 8.5 8.5 0 01-2.57.36zm1.1-12.5c.46-.02.87-.07.87-.07.41-.05.36-.65-.05-.63 0 0-1.23.1-2.02.1-.75 0-2-.1-2-.1-.41-.02-.46.6-.05.63 0 0 .38.05.79.07l1.17 3.2-1.65 4.94-2.74-8.14c.46-.02.87-.07.87-.07.41-.05.36-.65-.05-.63 0 0-1.23.1-2.02.1-.14 0-.31 0-.48-.01A8.48 8.48 0 0112 3.5c1.93 0 3.7.68 5.08 1.82-.03 0-.06-.01-.1-.01-.75 0-1.28.65-1.28 1.35 0 .63.36 1.16.75 1.79.29.51.63 1.17.63 2.12 0 .66-.25 1.42-.58 2.49l-.76 2.55-2.75-8.18zm5.35 1.4a6.3 6.3 0 01.4 2.16c0 .93-.17 1.98-.7 3.29l-2.83 8.17A8.5 8.5 0 0020.5 12a8.44 8.44 0 00-1.55-4.87z" />
    </svg>
  );
}
function ShopifyIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.5 3.5c-.3-.1-.6 0-.8.2-.1-.4-.4-1-1-1.4-.5-.3-1.1-.4-1.7-.2-.1-.3-.4-.6-.7-.7-1.7-.6-3.4.9-4 3.6l-1.9.6c-.6.2-.6.2-.7.7-.1.4-1.7 13-1.7 13L14.5 22l4.5-1.1S15.9 3.6 15.8 3.5c0-.1-.1 0-.3 0z" />
    </svg>
  );
}
function ReactIcon(props) {
  return (
    // React's real signature color (cyan), not plain white - and thicker
    // strokes (1.4 vs 1) so the rings actually read at 18px instead of
    // disappearing into thin hairlines.
    <svg viewBox="0 0 24 24" fill="none" stroke="#61DAFB" strokeWidth="1.4" {...props}>
      <circle cx="12" cy="12" r="2.4" fill="#61DAFB" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4.2" transform="rotate(120 12 12)" />
    </svg>
  );
}

function JavaScriptIcon(props) {
  return (
    // Removed the incorrect white background rect entirely - the real JS
    // logo is just black lettering directly on the yellow, nothing behind it
    // muting the color.
    <svg viewBox="0 0 24 24" fill="#000" {...props}>
      <path d="M15.5 16.3c.3.6.8 1 1.6 1 .7 0 1.2-.4 1.2-.9 0-.6-.5-.8-1.3-1.2l-.5-.2c-1.3-.6-2.1-1.3-2.1-2.8 0-1.4 1.1-2.5 2.7-2.5 1.2 0 2 .4 2.6 1.5l-1.4.9c-.3-.6-.7-.8-1.2-.8-.5 0-.9.3-.9.8 0 .5.3.8 1.1 1.1l.5.2c1.5.6 2.3 1.3 2.3 2.9 0 1.7-1.3 2.6-3.1 2.6-1.7 0-2.8-.8-3.3-1.9l1.5-.7zM9.7 16.4c.3.5.5.9 1.1.9.6 0 1-.2 1-1.1v-6h1.9v6c0 2-1.2 2.9-2.9 2.9-1.5 0-2.4-.8-2.9-1.8l1.8-1z" />
    </svg>
  );
}

function GitIcon(props) {
  return (
    // Thicker strokes (1.6 -> 2) so the connecting lines read clearly
    // against the saturated background instead of feeling faint.
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      <circle cx="6" cy="18" r="2" fill="currentColor" />
      <circle cx="18" cy="10" r="2" fill="currentColor" />
      <path d="M6 8v8" />
      <path d="M6 8c0 3 3 3 6 3s6 0 6-1" />
    </svg>
  );
}
function FigmaIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M8 2h5v5H8a2.5 2.5 0 010-5z" fill="#F24E1E" />
      <path d="M13 2h3a2.5 2.5 0 010 5h-3V2z" fill="#FF7262" />
      <path d="M13 9.5h3a2.5 2.5 0 010 5h-3v-5z" fill="#A259FF" />
      <path d="M8 9.5h5V17H8a2.5 2.5 0 010-7.5z" fill="#1ABCFE" />
      <path d="M8 17a2.5 2.5 0 105 0v-2.5H8V17z" fill="#0ACF83" />
    </svg>
  );
}

const TOOLS = [
  { name: "WordPress", icon: WordPressIcon, bg: "#21759B" },
  { name: "Shopify", icon: ShopifyIcon, bg: "#95BF47" },
  { name: "React", icon: ReactIcon, bg: "#0d1117" },
  { name: "JavaScript", icon: JavaScriptIcon, bg: "#F7DF1E" },
  { name: "Git", icon: GitIcon, bg: "#F05032" },
  { name: "Figma", icon: FigmaIcon, bg: "#1E1E1E" },
];

const ITEM_SIZE = 40;
const OVERLAP = 12;
const SPRING = { type: "spring", stiffness: 380, damping: 26, mass: 0.8 };

const DROP_Y = 42;
const PUSH_1 = 27;
const PUSH_2 = 11;

export default function StackRow({ tools = TOOLS, label = "My stack", showLabel = true }) {
  const [hovered, setHovered] = useState(null);
  const [tapped, setTapped] = useState(null); // touch-only: which icon's name is showing
  const [started, setStarted] = useState(false);
  const [supportsHover, setSupportsHover] = useState(true);
  const rootRef = useRef(null);
  const reduceMotion = useReducedMotion();

  // Real capability check, not a screen-width guess - a tablet with a mouse
  // still gets the full hover ripple; a wide phone in landscape doesn't get
  // a broken one it can't actually trigger correctly.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setSupportsHover(mq.matches);
    const onChange = (e) => setSupportsHover(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || reduceMotion || typeof IntersectionObserver === "undefined") {
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
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  // On a device without real hover, tapping anywhere outside the row closes
  // whichever tooltip is open - the touch equivalent of "mouse moved away".
  useEffect(() => {
    if (supportsHover) return;
    function onDocTap(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setTapped(null);
    }
    document.addEventListener("touchstart", onDocTap);
    return () => document.removeEventListener("touchstart", onDocTap);
  }, [supportsHover]);

  // Distance-based drop/push ripple - hover-capable devices ONLY. On touch,
  // this whole system is skipped entirely (see the render below), which is
  // what actually fixes the "stuck" bug: there's no synthetic hover state
  // left over from a tap to ever get stuck in.
  function stateFor(i) {
    const z = tools.length - i;
    if (hovered === null || reduceMotion || !supportsHover) {
      return { y: 0, x: 0, z };
    }
    const d = i - hovered;
    const ad = Math.abs(d);
    if (ad === 0) return { y: DROP_Y, x: 0, z };
    if (ad === 1) return { y: 0, x: d > 0 ? PUSH_1 : -PUSH_1, z };
    if (ad === 2) return { y: 0, x: d > 0 ? PUSH_2 : -PUSH_2, z };
    return { y: 0, x: 0, z };
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-3">
      {showLabel && (
        <motion.p
          initial={started || reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          className="text-xs font-medium italic text-neutral-400 dark:text-neutral-500"
        >
          {label}
        </motion.p>
      )}

      <div className="flex items-center" style={{ paddingTop: 2 }}>
        {tools.map((tool, i) => {
          const s = stateFor(i);
          const isHovered = supportsHover && hovered === i;
          const isTapped = !supportsHover && tapped === i;
          const showTip = isHovered || isTapped;

          return (
            <div
              key={tool.name}
              className="relative"
              style={{ marginLeft: i === 0 ? 0 : -OVERLAP, zIndex: s.z }}
              // Hover handlers only matter (and only fire meaningfully) on
              // real hover-capable devices; on touch they're inert since
              // nothing here calls setHovered from a touch path anymore.
              onMouseEnter={() => supportsHover && setHovered(i)}
              onMouseLeave={() => supportsHover && setHovered((h) => (h === i ? null : h))}
              onFocus={() => supportsHover && setHovered(i)}
              onBlur={() => supportsHover && setHovered((h) => (h === i ? null : h))}
              // Touch: a plain tap toggles the name tooltip - deterministic,
              // nothing to get stuck in, no icon-drop animation to fight with.
              onClick={() => {
                if (!supportsHover) setTapped((t) => (t === i ? null : i));
              }}
              tabIndex={0}
              aria-label={tool.name}
              aria-describedby={showTip ? `stack-tip-${i}` : undefined}
            >
              <motion.div
                initial={started || reduceMotion ? false : { opacity: 0, y: 14, scale: 0.6 }}
                animate={{ opacity: 1, x: s.x, y: s.y, scale: 1 }}
                transition={{ ...SPRING, delay: started ? 0 : i * 0.045 }}
              >
                <div
                  className="grid place-items-center rounded-full shadow-sm ring-2 ring-white dark:ring-neutral-950 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white"
                  style={{
                    width: ITEM_SIZE,
                    height: ITEM_SIZE,
                    background: tool.bg,
                    color: "#fff",
                    boxShadow: showTip
                      ? "0 12px 20px -6px rgba(0,0,0,0.35)"
                      : "0 2px 6px rgba(0,0,0,0.12)",
                  }}
                >
                  <tool.icon width={18} height={18} />
                </div>
              </motion.div>

              <AnimatePresence>
                {showTip && !reduceMotion && (
                  <motion.span
                    id={`stack-tip-${i}`}
                    role="tooltip"
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.9 }}
                    transition={SPRING}
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap
                               rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900
                               text-[11px] font-medium px-2.5 py-1 shadow-lg"
                  >
                    {tool.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}