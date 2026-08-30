"use client"

import { motion } from "framer-motion";

const types = ["Federal", "State", "Education", "Small Business", "Nonprofit"];

export default function MiniMenu({ activeType, setActiveType }) {
  return (
    <div className="flex flex-col space-y-3 text-white w-40">
      {types.map((type) => (
        <motion.div
          key={type}
          onClick={() => setActiveType(type)}
          whileHover={{ scale: 1.05, x: 5 }}
          className={`cursor-pointer px-4 py-2 rounded-md ${
            activeType === type
              ? "bg-[#1E90FF] text-white"
              : "bg-[#0F2A4A] text-[#A3B1C6]"
          }`}
        >
          {type}
        </motion.div>
      ))}
    </div>
  );
}
