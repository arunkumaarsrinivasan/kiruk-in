"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ThemeType =
  | "xp"
  | "web2"
  | "skeuomorph"
  | "flat"
  | "material"
  | "iphone"
  | "neumorphism"
  | "widgets"
  | "claymorphism"
  | "aurora"
  | "minimalism"
  | "paper"
  | "glass";

export const themeNames: Record<ThemeType, string> = {
  xp: "Windows XP (2001)",
  web2: "Web 2.0 (2008)",
  skeuomorph: "Skeuomorphism (2012)",
  flat: "Flat Design (2013)",
  material: "Material Design (2014)",
  iphone: "Mobile Era (2018)",
  neumorphism: "Neumorphism (2020)",
  widgets: "Bento Grids (2021)",
  claymorphism: "Claymorphism (2022)",
  aurora: "Aurora Gradients (2024)",
  minimalism: "Minimalism (2024)",
  paper: "Paper Journal (2025)",
  glass: "Glassmorphism (2024)",
};

interface ThemedCardProps {
  theme: ThemeType;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  isCollapsed?: boolean;
}

export function ThemedCard({ theme, children, className, onClick, isCollapsed }: ThemedCardProps) {
  // Global wireframe enforcement: uses era-based CSS variables
  const baseClasses = "relative overflow-hidden transition-all duration-300 group rounded-none wireframe-border";
  
  const themeStyles: Record<ThemeType, string> = {
    xp: "bg-[#ECE9D8] font-[Tahoma,sans-serif] [&_span.rounded-none]:!bg-white [&_span.rounded-none]:!border-[#003c74] [&_span.rounded-none]:!text-black [&_span.rounded-none]:!rounded-none [&_span.rounded-none]:!shadow-none",
    web2: "bg-gradient-to-b from-white via-[#f0f0f0] to-[#d0d0d0] [&_span.rounded-none]:!bg-gradient-to-b [&_span.rounded-none]:!from-white [&_span.rounded-none]:!to-[#e0e0e0] [&_span.rounded-none]:!border-black [&_span.rounded-none]:!shadow-none",
    skeuomorph: "bg-[#fdfbf7] font-[Georgia,serif] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] [&_span.rounded-none]:!bg-[#f8f5e6] [&_span.rounded-none]:!border-black [&_span.rounded-none]:!border-dashed [&_span.rounded-none]:!text-[#5c4b37]",
    flat: "bg-[#2ecc71] font-[Helvetica,Arial,sans-serif] text-white [&_span.rounded-none]:!bg-[#27ae60] [&_span.rounded-none]:!text-white [&_span.rounded-none]:!border-black [&_span.rounded-none]:!rounded-none [&_h3]:!text-white [&_p]:!text-white/90",
    material: "bg-white border-t-4 border-t-[#6200ea] [&_span.rounded-none]:!bg-[#6200ea] [&_span.rounded-none]:!text-white [&_span.rounded-none]:!rounded-none [&_span.rounded-none]:!shadow-none [&_span.rounded-none]:uppercase [&_span.rounded-none]:tracking-wider [&_span.rounded-none]:text-[10px] [&_span.rounded-none]:font-bold",
    iphone: "bg-white border-black [&_span.rounded-none]:!bg-[#f2f2f7] [&_span.rounded-none]:!text-blue-500 [&_span.rounded-none]:!border-black [&_h3]:!text-black [&_p]:!text-gray-600",
    neumorphism: "bg-[#e0e5ec] text-[#4a4a4a] [&_span.rounded-none]:!bg-[#e0e5ec] [&_span.rounded-none]:!border-black [&_span.rounded-none]:!text-[#4a4a4a]",
    widgets: "bg-white hover:scale-[1.02] transition-transform [&_span.rounded-none]:!bg-gray-100 [&_span.rounded-none]:!text-black [&_span.rounded-none]:!border-black",
    claymorphism: "bg-white backdrop-blur-sm [&_span.rounded-none]:!bg-[#f0f0f3] [&_span.rounded-none]:!border-black [&_span.rounded-none]:!rounded-none",
    aurora: "bg-gradient-to-br from-[#2E3192] to-[#1BFFFF] text-white [&_span.rounded-none]:!bg-white/20 [&_span.rounded-none]:!backdrop-blur-md [&_span.rounded-none]:!border-black [&_span.rounded-none]:!text-white [&_h3]:!text-white [&_p]:!text-white/90",
    minimalism: "bg-white text-slate-900 font-[Helvetica,Arial,sans-serif] [&_h3]:!text-slate-900 [&_p]:!text-slate-600 [&_span.rounded-none]:!bg-slate-100 [&_span.rounded-none]:!text-slate-800 [&_span.rounded-none]:!border-black [&_span.rounded-none]:!uppercase [&_span.rounded-none]:!tracking-[0.15em] [&_span.rounded-none]:!text-[10px] [&_span.rounded-none]:!font-semibold",
    paper: "bg-[#fffdf5] text-[#2f271a] font-mono [&_h3]:!text-[#1f1510] [&_p]:!text-[#4b4336] [&_span.rounded-none]:!bg-white [&_span.rounded-none]:!border-black [&_span.rounded-none]:!text-[#3b3227]",
    glass: "bg-white/30 backdrop-blur-xl border-black [&_span.rounded-none]:!bg-white/40 [&_span.rounded-none]:!backdrop-blur-md [&_span.rounded-none]:!border-black [&_span.rounded-none]:!text-gray-800 [&_span.rounded-none]:!shadow-none [&_h3]:!text-gray-900 [&_p]:!text-gray-700 [&_span]:!text-gray-800",
  };

  const contentWrapperStyles: Record<ThemeType, string> = {
    xp: "p-4 bg-white m-1 border border-black",
    web2: "p-4",
    skeuomorph: "p-8",
    flat: "p-8",
    material: "p-8",
    iphone: "p-8 pt-14 bg-white h-full overflow-hidden relative",
    neumorphism: "p-8",
    widgets: "p-8",
    claymorphism: "p-8",
    aurora: "p-8",
    minimalism: "p-8",
    paper: "p-8",
    glass: "p-8 relative z-10",
  };

  // XP Header
  const XPHeader = () => (
    <div className="bg-gradient-to-r from-[#0058EE] via-[#3A93FF] to-[#0058EE] px-2 py-1 flex justify-between items-center border-b border-black mx-[2px] mt-[2px]">
      <span className="text-white font-bold text-xs font-[Tahoma] flex items-center gap-1">
        <img src="https://win98icons.alexmeub.com/icons/png/computer_explorer-0.png" className="w-3 h-3" alt="" />
        Kiruk.exe
      </span>
      <div className="flex gap-1">
        <div className="w-4 h-4 bg-[#D7432D] border border-white/60 flex items-center justify-center text-white text-[12px] cursor-pointer hover:bg-[#ff5a42]">×</div>
      </div>
    </div>
  );

  // iPhone Notch - Wireframe style
  const IPhoneNotch = () => (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black z-30 flex justify-center items-center">
        <div className="w-12 h-1 bg-gray-800 rounded-none opacity-50"></div>
    </div>
  );

  return (
    <div 
      className={cn(baseClasses, themeStyles[theme], className)}
      onClick={onClick}
    >
      {theme === "xp" && <XPHeader />}
      {theme === "iphone" && <IPhoneNotch />}
      
      <div className={cn("h-full", contentWrapperStyles[theme])}>
        {/* iPhone Status Bar */}
        {theme === "iphone" && (
            <div className="absolute top-2 left-4 right-4 flex justify-between text-[10px] text-black font-medium z-20 px-2">
                <span>9:41</span>
                <div className="flex gap-1">
                    <span>5G</span>
                    <span>100%</span>
                </div>
            </div>
        )}
        
        {children}
      </div>

      {/* Theme specific overlays/decorations */}
      {theme === "web2" && (
        <>
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </>
      )}
      {theme === "skeuomorph" && (
        <div className="absolute inset-2 border-2 border-dashed border-black pointer-events-none opacity-20" />
      )}
      {theme === "paper" && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(#f1e6cf_1px,transparent_1px)] bg-[size:100%_28px] opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#f1e6cf_1px,transparent_1px)] bg-[size:28px_100%] opacity-20 pointer-events-none" />
        </>
      )}
      {theme === "glass" && (
        <>
            {/* Vivid background blobs for glass effect visibility */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 blur-[80px] opacity-60 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-600 to-cyan-600 blur-[80px] opacity-60 pointer-events-none" />
            
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Shine reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
        </>
      )}
    </div>
  );
}
