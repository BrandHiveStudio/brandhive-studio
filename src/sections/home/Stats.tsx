"use client";

import { motion } from "framer-motion";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Counter from "@/components/ui/Counter";

interface StatsProps {
  contentMap?: Record<string, string>;
}

export default function Stats({ contentMap }: StatsProps) {
  const statsList = [
    {
      number: parseInt(contentMap?.["stats_projects_number"] || "50", 10) || 50,
      suffix: contentMap?.["stats_projects_suffix"] ?? "+",
      label: contentMap?.["stats_projects_label"] || "Projects Delivered",
      icon: (
        <svg className="size-6 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      number: parseInt(contentMap?.["stats_clients_number"] || "25", 10) || 25,
      suffix: contentMap?.["stats_clients_suffix"] ?? "+",
      label: contentMap?.["stats_clients_label"] || "Clients Served",
      icon: (
        <svg className="size-6 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      number: parseInt(contentMap?.["stats_years_number"] || "2", 10) || 2,
      suffix: contentMap?.["stats_years_suffix"] ?? "+",
      label: contentMap?.["stats_years_label"] || "Years of Experience",
      icon: (
        <svg className="size-6 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      number: parseInt(contentMap?.["stats_satisfaction_number"] || "100", 10) || 100,
      suffix: contentMap?.["stats_satisfaction_suffix"] ?? "%",
      label: contentMap?.["stats_satisfaction_label"] || "Client Satisfaction",
      icon: (
        <svg className="size-6 text-[#16C7FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
  ];
  return (
    <Section className="py-12 bg-transparent">
      <Container>
        <div className="relative w-full rounded-3xl bg-[#11161C]/55 backdrop-blur-md p-8 sm:p-10 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#16C7FF]/8 blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-[#16C7FF]/8 blur-[80px] pointer-events-none" />
          
          <div className="relative grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 items-center justify-items-center z-10 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {statsList.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-6 md:pt-0 first:pt-0 group/item"
              >
                <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(22,199,255,0.05)] shrink-0 group-hover/item:border-[#16C7FF]/35 transition-all duration-300">
                  {stat.icon}
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">
                    <Counter value={stat.number} />{stat.suffix}
                  </p>
                  <span className="text-[10px] sm:text-xs text-white/50 uppercase font-bold tracking-wider block mt-1.5">
                    {stat.label}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
