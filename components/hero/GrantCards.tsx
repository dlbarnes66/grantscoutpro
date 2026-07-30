"use client";

import { motion } from "framer-motion";
import { getGrantsForType } from "@/lib/hero/getGrantsForType";

interface GrantCardsProps {
  activeType: string;
}

export default function GrantCards({ activeType }: GrantCardsProps) {
  const grants = getGrantsForType(activeType);

  return (
    <div className="space-y-4">
      {grants.map((grant) => (
        <motion.div
          key={grant.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-[#0F2A4A] border border-[#00E5FF]/20 p-4 rounded-lg text-white"
        >
          <h4 className="font-semibold">{grant.title}</h4>
          <p className="text-[#A3B1C6]">{grant.amount}</p>
          <p className="text-[#A3B1C6]">Deadline: {grant.deadline}</p>
        </motion.div>
      ))}
    </div>
  );
}
