"use client";

import { motion } from "framer-motion";

export default function HeroLeft() {
  return (
    <div className="flex flex-col justify-center text-white space-y-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold leading-tight"
      >
        GrantRadar: Your AI-powered grant intelligence engine
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-lg text-[#A3B1C6]"
      >
        Find, analyze, and win funding — automatically.
      </motion.p>

      <div className="flex space-x-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 bg-[#1E90FF] text-white rounded-lg shadow-lg hover:shadow-[#00E5FF] transition"
        >
          Start Free Trial
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="px-6 py-3 border border-[#1E90FF] text-[#1E90FF] rounded-lg"
        >
          See Interactive Demo
        </motion.button>
      </div>
    </div>
  );
}
