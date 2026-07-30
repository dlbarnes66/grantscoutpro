"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import MiniMenu from "./MiniMenu";
import AnimatedDashboard from "./AnimatedDashboard";

export default function HeroRightInteractive() {
  const [activeType, setActiveType] = useState("Federal");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0D223F]/80 border border-[#00E5FF]/20 rounded-xl p-6 shadow-xl backdrop-blur-md flex space-x-6"
    >
      <MiniMenu activeType={activeType} setActiveType={setActiveType} />
      <AnimatedDashboard activeType={activeType} />
    </motion.div>
  );
}
