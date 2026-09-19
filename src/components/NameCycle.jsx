import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const variants = [
  { text: "Nauha", className: "font-display" },
  { text: "نوها", className: "font-arabic", dir: "rtl" },
  { text: "नौहा", className: "font-hindi" },
  { text: "娜哈", className: "font-chinese" },
];

export default function NameCycle() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % variants.length);
    }, 900); // faster loop, continuous
    return () => clearInterval(timer);
  }, []);

  const current = variants[index];

  return (
    <span className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          dir={current.dir || "ltr"}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
         className={`inline-block font-light uppercase ${current.className}`}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}