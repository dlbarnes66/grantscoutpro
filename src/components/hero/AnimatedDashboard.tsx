"use client";

import { motion } from "framer-motion";
import RadarMap from "./RadarMap";
import GrantCards from "./GrantCards";

export interface AnimatedDashboardProps {
  activeType: string;
}

export default function AnimatedDashboard({ activeType }: AnimatedDashboardProps) {
  return (
    <motion.div
      key={activeType}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex-1 space-y-6"
    >
      <RadarMap activeType={activeType} />
      <GrantCards activeType={activeType} />
    </motion.div>
  );
}
