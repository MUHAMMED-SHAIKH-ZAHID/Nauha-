import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const nameVariants = [
  { lang: "English", text: "Nauha", className: "font-serif italic" },
  { lang: "Arabic", text: "نوها", className: "font-arabic", dir: "rtl" },
  { lang: "Hindi", text: "नौहा", className: "font-hindi" },
  { lang: "Chinese", text: "娜哈", className: "font-chinese" },
  { lang: "French", text: "Nauha", className: "font-serif italic" },
];

export default function Preloader({ onComplete }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= nameVariants.length - 1) {
      const endTimer = setTimeout(onComplete, 1800);
      return () => clearTimeout(endTimer);
    }
    const timer = setTimeout(() => setIndex((i) => i + 1), 1800);
    return () => clearTimeout(timer);
  }, [index, onComplete]);

  const current = nameVariants[index];

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#fffdf9] m-0 p-0"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={current.lang}
          dir={current.dir || "ltr"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className={`text-[clamp(2.5rem,9vw,6.5rem)] font-black ${current.className}`}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}