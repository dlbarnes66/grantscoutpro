"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface RadarMapProps {
  activeType: string;
}

export default function RadarMap({ activeType }: RadarMapProps) {
  const [points, setPoints] = useState<{ top: string; left: string }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 8 }).map(() => ({
      top: `${Math.random() * 80 + 10}%`,
      left: `${Math.random() * 80 + 10}%`,
    }));

    setPoints(generated);
  }, [activeType]);

  return (
    <div className="relative w-full h-48 bg-[#0A1A2F] rounded-lg overflow-hidden">
      {points.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-[#00E5FF] rounded-full"
          style={pos}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}
