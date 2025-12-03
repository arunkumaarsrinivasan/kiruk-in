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
  | "brutalism"
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
  brutalism: "Neo-Brutalism (2023)",
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
  const baseClasses = "relative overflow-hidden transition-all duration-300 group";
  
  const themeStyles: Record<ThemeType, string> = {
    xp: "rounded-t-lg rounded-b-none border-2 border-[#0055EA] bg-[#ECE9D8] shadow-[4px_4px_0px_rgba(0,0,0,0.2)] font-[Tahoma,sans-serif] [&_span.rounded-full]:!bg-white [&_span.rounded-full]:!border-[#003c74] [&_span.rounded-full]:!text-black [&_span.rounded-full]:!rounded-[2px] [&_span.rounded-full]:!shadow-none",
    web2: "rounded-lg bg-gradient-to-b from-white via-[#f0f0f0] to-[#d0d0d0] border border-[#999] shadow-lg ring-1 ring-white/60 [&_span.rounded-full]:!bg-gradient-to-b [&_span.rounded-full]:!from-white [&_span.rounded-full]:!to-[#e0e0e0] [&_span.rounded-full]:!border-[#aaa] [&_span.rounded-full]:!shadow-[0_1px_2px_rgba(0,0,0,0.1)]",
    skeuomorph: "rounded-lg bg-[#fdfbf7] border-2 border-[#d4c5b0] shadow-[inset_0_0_20px_rgba(0,0,0,0.05),0_4px_6px_rgba(0,0,0,0.1)] font-[Georgia,serif] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] [&_span.rounded-full]:!bg-[#f8f5e6] [&_span.rounded-full]:!border-[#d4c5b0] [&_span.rounded-full]:!border-dashed [&_span.rounded-full]:!text-[#5c4b37]",
    flat: "rounded-none bg-[#2ecc71] border-none shadow-none font-[Helvetica,Arial,sans-serif] text-white [&_span.rounded-full]:!bg-[#27ae60] [&_span.rounded-full]:!text-white [&_span.rounded-full]:!border-none [&_span.rounded-full]:!rounded-sm [&_h3]:!text-white [&_p]:!text-white/90",
    material: "rounded-sm bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.25),0_10px_10px_rgba(0,0,0,0.22)] transition-shadow border-t-4 border-[#6200ea] [&_span.rounded-full]:!bg-[#6200ea] [&_span.rounded-full]:!text-white [&_span.rounded-full]:!rounded-[2px] [&_span.rounded-full]:!shadow-md [&_span.rounded-full]:uppercase [&_span.rounded-full]:tracking-wider [&_span.rounded-full]:text-[10px] [&_span.rounded-full]:font-bold",
    iphone: "rounded-[3rem] bg-white border-[8px] border-[#d1d1d6] shadow-xl ring-1 ring-gray-400 [&_span.rounded-full]:!bg-[#f2f2f7] [&_span.rounded-full]:!text-blue-500 [&_span.rounded-full]:!border-none [&_h3]:!text-black [&_p]:!text-gray-600",
    neumorphism: "rounded-[2rem] bg-[#e0e5ec] shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff] border-none text-[#4a4a4a] [&_span.rounded-full]:!bg-[#e0e5ec] [&_span.rounded-full]:!shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] [&_span.rounded-full]:!border-none [&_span.rounded-full]:!text-[#4a4a4a]",
    widgets: "rounded-[2rem] bg-white shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 hover:scale-[1.02] transition-transform [&_span.rounded-full]:!bg-gray-100 [&_span.rounded-full]:!text-black [&_span.rounded-full]:!border-none",
    claymorphism: "rounded-[2.5rem] bg-white shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.1),inset_10px_10px_20px_rgba(255,255,255,1),10px_10px_20px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm [&_span.rounded-full]:!bg-[#f0f0f3] [&_span.rounded-full]:!shadow-[inset_-2px_-2px_5px_rgba(0,0,0,0.1),inset_2px_2px_5px_rgba(255,255,255,1)] [&_span.rounded-full]:!border-none [&_span.rounded-full]:!rounded-xl",
    brutalism: "rounded-none border-2 border-black bg-[#FFDE59] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-mono [&_span.rounded-full]:!bg-white [&_span.rounded-full]:!border-2 [&_span.rounded-full]:!border-black [&_span.rounded-full]:!text-black [&_span.rounded-full]:!rounded-none [&_span.rounded-full]:!shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
    aurora: "rounded-2xl bg-gradient-to-br from-[#2E3192] to-[#1BFFFF] shadow-lg text-white [&_span.rounded-full]:!bg-white/20 [&_span.rounded-full]:!backdrop-blur-md [&_span.rounded-full]:!border-white/30 [&_span.rounded-full]:!text-white [&_h3]:!text-white [&_p]:!text-white/90",
    minimalism: "rounded-[2rem] bg-white border border-slate-200 shadow-[0_30px_70px_rgba(15,23,42,0.08)] text-slate-900 font-[Helvetica,Arial,sans-serif] [&_h3]:!text-slate-900 [&_p]:!text-slate-600 [&_span.rounded-full]:!bg-slate-100 [&_span.rounded-full]:!text-slate-800 [&_span.rounded-full]:!border-slate-200 [&_span.rounded-full]:!uppercase [&_span.rounded-full]:!tracking-[0.15em] [&_span.rounded-full]:!text-[10px] [&_span.rounded-full]:!font-semibold",
    paper: "rounded-[2.5rem] bg-[#fffdf5] border border-[#e5dcc7] shadow-[0_22px_55px_rgba(15,23,42,0.12)] text-[#2f271a] font-['Patrick_Hand',cursive] [&_h3]:!text-[#1f1510] [&_p]:!text-[#4b4336] [&_span.rounded-full]:!bg-white [&_span.rounded-full]:!border-[#e5dcc7] [&_span.rounded-full]:!text-[#3b3227] [&_span.rounded-full]:!shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]",
    glass: "rounded-3xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] [&_span.rounded-full]:!bg-white/40 [&_span.rounded-full]:!backdrop-blur-md [&_span.rounded-full]:!border-white/50 [&_span.rounded-full]:!text-gray-800 [&_span.rounded-full]:!shadow-sm [&_h3]:!text-gray-900 [&_p]:!text-gray-700 [&_span]:!text-gray-800",
  };

  const contentWrapperStyles: Record<ThemeType, string> = {
    xp: "p-6 bg-white m-1 border border-[#828790] shadow-[inset_1px_1px_0px_#000000,inset_-1px_-1px_0px_#dcdcdc]",
    web2: "p-6",
    skeuomorph: "p-8",
    flat: "p-8",
    material: "p-8",
    iphone: "p-8 pt-14 bg-white h-full rounded-[2.5rem] overflow-hidden relative",
    neumorphism: "p-10",
    widgets: "p-8",
    claymorphism: "p-10",
    brutalism: "p-6",
    aurora: "p-8",
    minimalism: "p-10",
    paper: "p-8",
    glass: "p-8 relative z-10",
  };

  // XP Header
  const XPHeader = () => (
    <div className="bg-gradient-to-r from-[#0058EE] via-[#3A93FF] to-[#0058EE] px-2 py-1 flex justify-between items-center shadow-sm border-b border-[#003c74] mx-[2px] mt-[2px] rounded-t-[3px]">
      <span className="text-white font-bold text-xs drop-shadow-md font-[Tahoma] flex items-center gap-1">
        <img src="https://win98icons.alexmeub.com/icons/png/computer_explorer-0.png" className="w-3 h-3" alt="" />
        Kiruk.exe
      </span>
      <div className="flex gap-1">
        <div className="w-5 h-5 bg-[#D7432D] rounded-[3px] border border-white/60 flex items-center justify-center text-white text-[12px] shadow-sm cursor-pointer hover:bg-[#ff5a42] active:border-inset">×</div>
      </div>
    </div>
  );

  // iPhone Notch
  const IPhoneNotch = () => (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-black rounded-b-2xl z-30 flex justify-center items-center">
        <div className="w-12 h-1 bg-gray-800 rounded-full opacity-50"></div>
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
            <div className="absolute top-2 left-6 right-6 flex justify-between text-[10px] text-black font-medium z-20 px-2">
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
        <div className="absolute inset-2 border-2 border-dashed border-[#d4c5b0] rounded-lg pointer-events-none opacity-50" />
      )}
      {theme === "paper" && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(#f1e6cf_1px,transparent_1px)] bg-[size:100%_28px] opacity-60 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#f1e6cf_1px,transparent_1px)] bg-[size:28px_100%] opacity-20 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-transparent to-amber-100/30 pointer-events-none" />
        </>
      )}
      {theme === "glass" && (
        <>
            {/* Vivid background blobs for glass effect visibility */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full blur-[80px] opacity-60 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-blue-600 to-cyan-600 rounded-full blur-[80px] opacity-60 pointer-events-none" />
            
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            {/* Shine reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
        </>
      )}
    </div>
  );
}
