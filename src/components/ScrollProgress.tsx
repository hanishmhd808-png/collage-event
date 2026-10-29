"use client";

import { useScroll, useSpring, motion } from "framer-motion";

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40 });

  return (
    <motion.div
      style={{
        scaleX,
        background: "linear-gradient(90deg, #0a84ff, #bf5af2, #32d2e8)",
        originX: 0,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "2px",
        zIndex: 100,
      }}
    />
  );
}
