"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import the heavy chat dialog window to reduce initial JavaScript load
const FloatingChatbotDialog = dynamic(() => import("./FloatingChatbotDialog"), {
  ssr: false,
});

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSessionKey, setChatSessionKey] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const handleClose = () => {
    setIsOpen(false);
    setChatSessionKey((prev) => prev + 1);
    try {
      window.localStorage.removeItem("brandhive-chat-history");
    } catch {
      // Ignore
    }
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[69] bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end sm:bottom-6 sm:right-6">
        <AnimatePresence mode="wait">
          {isOpen ? (
            <FloatingChatbotDialog key={`brandhive-chat-${chatSessionKey}`} onClose={handleClose} />
          ) : (
            <motion.button
              key="chat-toggle"
              type="button"
              onClick={() => setIsOpen(true)}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.02, boxShadow: "0 20px 80px rgba(0,0,0,0.55), 0 0 30px rgba(22,199,255,0.35)" }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center gap-3 rounded-full border border-[#16C7FF]/35 bg-[#061018]/90 px-6 py-2.5 shadow-[0_18px_70px_rgba(0,0,0,0.45),0_0_24px_rgba(22,199,255,0.2)] backdrop-blur-md transition duration-300 hover:border-[#16C7FF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16C7FF] focus-visible:ring-offset-4 focus-visible:ring-offset-[#050608]"
              aria-label="Ask HIVE AI"
              aria-expanded={false}
              aria-controls="brandhive-chat"
            >
              <Image
                src="/favicon/official_HIVE_AI_Symbol.png"
                alt="HIVE AI Symbol"
                width={40}
                height={40}
                className="object-contain shrink-0"
              />
              <span className="flex items-center gap-1.5 text-sm tracking-wide">
                <span className="font-medium text-white">Ask</span>
                <span className="font-bold text-[#12BDF7]">HIVE AI</span>
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
