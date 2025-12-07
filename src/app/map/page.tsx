'use client';

import { SketchHeading } from '@/components/ui/sketch-elements';

export default function MapPage() {
  return (
    <main className="flex h-screen w-full flex-col items-center justify-center map-bg p-8 text-center">
      <div className="max-w-md space-y-10">
        <SketchHeading level={1} className="text-center font-bold">
          World Map
        </SketchHeading>
        
        <div className="relative rounded-none border border-dashed border-[#0f0f0f]/10 bg-white/40 p-8 backdrop-blur-sm">
          <div className="absolute -top-3 -left-3 h-6 w-6 rounded-none border border-[#0f0f0f]/20 bg-[#facc15]" />
          <div className="absolute -bottom-3 -right-3 h-6 w-6 rounded-none border border-[#0f0f0f]/20 bg-[#ef4444]" />
          
          <p className="handwritten text-3xl text-[#0f0f0f]/80 rotate-[-2deg]">
            Arun's world is yet to be revealed...
          </p>
          <p className="mt-6 handwritten text-xl text-[#0f0f0f]/60">
            Wait for it...
          </p>
        </div>
      </div>
    </main>
  );
}
