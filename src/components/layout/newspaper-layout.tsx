'use client';

import React from 'react';
import { portfolioData } from '@/data/portfolio-data';
import WeatherWidget from './newspaper-widgets/WeatherWidget';
import MoodWidget from './newspaper-widgets/MoodWidget';
import LocationWidget from './newspaper-widgets/LocationWidget';
import BreakingNews from './newspaper-widgets/BreakingNews';
import JobNews from './newspaper-widgets/JobNews';
import { cn, GRID_SIZE } from '@/lib/utils';

export default function NewspaperLayout() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[var(--bg-main)] py-8 px-4 md:px-8 relative">
      {/* Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          opacity: 0.3,
          imageRendering: 'pixelated' as any,
        }}
      />
      
      {/* Scanlines effect for retro pixel feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Pixel Grid Header */}
        <header className="text-center mb-8 p-6 bg-[var(--bg-card)]">
          <div className="grid grid-cols-12 gap-1 mb-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-2 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
            ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-mono font-bold mb-2 uppercase tracking-wider" 
              style={{ 
                textShadow: '4px 4px 0 var(--border-color)',
                letterSpacing: '0.1em'
              }}>
            THE DAILY KIRUK
          </h1>
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs md:text-sm font-mono">
            <div className="p-2 bg-[var(--bg-main)]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Volume</div>
              <div className="font-bold">VOL. 1, NO. {today.getDate()}</div>
            </div>
            <div className="p-2 bg-[var(--bg-main)]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Date</div>
              <div className="font-bold">{dateStr.toUpperCase()}</div>
            </div>
            <div className="p-2 bg-[var(--bg-main)]">
              <div className="text-[10px] text-[var(--text-muted)] uppercase">Edition</div>
              <div className="font-bold">BANGALORE</div>
            </div>
          </div>
        </header>

        {/* Main Headline Section - Pixel Grid Style */}
        <section className="mb-6 p-6 bg-[var(--bg-card)]">
          <div className="p-4 md:p-6 mb-4 bg-[var(--accent-color)]">
            <h2 className="text-2xl md:text-4xl font-mono font-bold uppercase leading-tight text-[var(--bg-main)]">
              NEW CREATIVE TECHNOLOGIST IN TOWN
            </h2>
            <p className="text-sm md:text-lg mt-2 font-mono text-[var(--bg-main)] opacity-95">
              Currently in Bangalore • Loves Working with Creative Minds • Helps Build from 0 to 1 Design
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-4 gap-1 mb-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
                ))}
              </div>
              <p className="text-sm md:text-base leading-relaxed font-mono">
                <span className="font-bold text-lg uppercase">BANGALORE</span> — Meet <strong>Arun Kumaar Sreenivasan</strong>, 
                a creative technologist who bridges the gap between design and development. Currently based in Bangalore, 
                Arun is passionate about working with creative minds and helping people build from 0 to 1 design. 
                He believes that every great product starts with a scribble and transforms into a digital experience.
              </p>
              <p className="text-sm md:text-base leading-relaxed font-mono">
                <strong>CREATIVE COLLABORATION:</strong> Arun loves working with creative minds—designers, developers, 
                entrepreneurs, and artists. He specializes in helping teams go from concept (0) to first launch (1), 
                whether it's a design system, a product feature, or an entire application. His approach combines 
                design thinking with technical execution.
              </p>
              <p className="text-sm md:text-base leading-relaxed font-mono">
                <strong>FROM 0 TO 1:</strong> Need help taking your idea from a sketch to a working prototype? 
                Arun helps teams build from scratch, focusing on user-centered design, clean code, and scalable architecture. 
                He's worked on everything from design systems to cloud microservices, always with a focus on the user experience.
              </p>
              <p className="text-sm md:text-base leading-relaxed font-mono">
                <strong>PLAY TO LEARN:</strong> This interactive portfolio lets you play games to discover more about Arun. 
                Click the <span className="bg-[var(--accent-color)] text-[var(--bg-main)] px-2 py-1 font-bold">▶ PLAY</span> button 
                in the bottom-left to start mini-games that reveal his skills, projects, and personality!
              </p>
            </div>
            <div className="p-4 bg-[var(--bg-main)]">
              <div className="grid grid-cols-2 gap-1 mb-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-2 border border-[var(--border-color)] bg-[var(--bg-card)]"></div>
                ))}
              </div>
              <h3 className="font-mono font-bold text-sm mb-2 uppercase">QUICK FACTS</h3>
              <ul className="space-y-2 text-xs font-mono">
                <li className="border-l-2 border-[var(--accent-color)] pl-2">
                  <strong>Name:</strong> Arun Kumaar Sreenivasan
                </li>
                <li className="border-l-2 border-[var(--accent-color)] pl-2">
                  <strong>Location:</strong> Bangalore, India
                </li>
                <li className="border-l-2 border-[var(--accent-color)] pl-2">
                  <strong>Title:</strong> Full-Stack Developer & Designer
                </li>
                <li className="border-l-2 border-[var(--accent-color)] pl-2">
                  <strong>Email:</strong> arunkumaar.srinivasan@gmail.com
                </li>
                <li className="border-l-2 border-[var(--accent-color)] pl-2">
                  <strong>Tagline:</strong> "Scribbles that turn into digital experiences"
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Breaking News Section */}
        <BreakingNews />

        {/* Widgets Row - Pixel Grid Style */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <WeatherWidget />
          <MoodWidget />
          <LocationWidget />
        </section>

        {/* Job News Section */}
        <JobNews />

        {/* Hobbies Section */}
        <section className="mb-6">
          <div className="bg-[var(--accent-color)] p-3 mb-4">
            <h2 className="text-xl md:text-2xl font-mono font-bold uppercase text-[var(--bg-main)] flex items-center gap-2">
              <span>🎯</span> HOBBIES & INTERESTS
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { emoji: '🎒', title: 'Backpacker', desc: 'Exploring new places and cultures' },
              { emoji: '⛰️', title: 'Trekker', desc: '15+ treks in Western Ghats, aiming for Himalayas' },
              { emoji: '🏓', title: 'Table Tennis Player', desc: 'Quick reflexes help in both ping pong and debugging' },
              { emoji: '🎨', title: 'Artist', desc: 'Sketching, drawing, and visual storytelling' },
              { emoji: '👨‍🏫', title: 'Mentor', desc: 'Teaching 60+ students in design workshops' },
              { emoji: '📸', title: 'Life Documenter', desc: 'Capturing moments and documenting the journey' },
            ].map((hobby, idx) => (
              <article 
                key={idx}
                className="p-4 bg-[var(--bg-card)]"
              >
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
                  ))}
                </div>
                <div className="text-3xl mb-2">{hobby.emoji}</div>
                <h3 className="font-mono font-bold text-sm mb-1 uppercase">{hobby.title}</h3>
                <p className="text-xs font-mono text-[var(--text-muted)]">{hobby.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Entertainment News & Skills News */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Entertainment News - Contact & Instagram */}
          <article className="p-6 bg-[var(--bg-card)]">
            <div className="p-2 mb-3 bg-[var(--accent-color)]">
              <h3 className="font-mono font-bold text-lg uppercase text-[var(--bg-main)]">🎬 ENTERTAINMENT NEWS</h3>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-[var(--bg-main)]">
                <h4 className="font-mono font-bold text-sm mb-2 uppercase">📧 Contact Information</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="border-l-2 border-[var(--accent-color)] pl-2">
                    <strong>Email:</strong> arunkumaar.srinivasan@gmail.com
                  </div>
                  <div className="border-l-2 border-[var(--accent-color)] pl-2">
                    <strong>LinkedIn:</strong> /in/arunkumaarsreenivasan/
                  </div>
                  <div className="border-l-2 border-[var(--accent-color)] pl-2">
                    <strong>GitHub:</strong> /arunkumaarsrinivasan
                  </div>
                  <div className="border-l-2 border-[var(--accent-color)] pl-2">
                    <strong>Response Time:</strong> 24 hours
                  </div>
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-main)]">
                <h4 className="font-mono font-bold text-sm mb-2 uppercase">📷 Instagram</h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="border-l-2 border-[var(--accent-color)] pl-2">
                    <strong>Personal:</strong> @arunum.avan.seyalum
                  </div>
                  <div className="border-l-2 border-[var(--accent-color)] pl-2">
                    <strong>Professional:</strong> @kirukism
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] mt-2 italic">
                    Follow for design process, life documentation, and creative journey
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Skills News */}
          <article className="p-6 bg-[var(--bg-card)]">
            <div className="p-2 mb-3 bg-[var(--accent-color)]">
              <h3 className="font-mono font-bold text-lg uppercase text-[var(--bg-main)]">⚡ SKILL NEWS</h3>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-[var(--bg-main)]">
                <h4 className="font-mono font-bold text-sm mb-2 uppercase">🎨 Design Skills</h4>
                <div className="text-xs font-mono space-y-1">
                  <div>• UX/UI Design • Design Systems • User Research</div>
                  <div>• Figma • Design Thinking • Information Architecture</div>
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-main)]">
                <h4 className="font-mono font-bold text-sm mb-2 uppercase">💻 Development Skills</h4>
                <div className="text-xs font-mono space-y-1">
                  <div>• React • Next.js • TypeScript • Node.js</div>
                  <div>• Spring Boot • AWS • Microservices</div>
                </div>
              </div>
              <div className="p-3 bg-[var(--bg-main)]">
                <h4 className="font-mono font-bold text-sm mb-2 uppercase">🤖 AI & Specialization</h4>
                <div className="text-xs font-mono space-y-1">
                  <div>• AI Experience (AX) Design • AI Integration</div>
                  <div>• Prompt Engineering • LLM Integration</div>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* Additional Content Sections - Pixel Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <article className="p-6 bg-[var(--bg-card)]">
            <div className="p-2 mb-3 bg-[var(--accent-color)]">
              <h3 className="font-mono font-bold text-lg uppercase text-[var(--bg-main)]">GAME INSTRUCTIONS</h3>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
              ))}
            </div>
            <h4 className="font-mono font-bold text-sm mb-2 uppercase">How to Play Mini Games</h4>
            <ol className="text-xs leading-relaxed font-mono space-y-2 list-decimal list-inside">
              <li>Click the <strong>▶ PLAY</strong> button (bottom-left)</li>
              <li>Read the game instructions that appear</li>
              <li>Use your cursor/mouse to interact</li>
              <li>Reach 50 points to complete the game</li>
              <li>Each game reveals facts about me!</li>
            </ol>
          </article>

          <article className="p-6 bg-[var(--bg-card)]">
            <div className="p-2 mb-3 bg-[var(--accent-color)]">
              <h3 className="font-mono font-bold text-lg uppercase text-[var(--bg-main)]">PORTFOLIO NAVIGATION</h3>
            </div>
            <div className="grid grid-cols-4 gap-1 mb-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
              ))}
            </div>
            <h4 className="font-mono font-bold text-sm mb-2 uppercase">Explore These Pages</h4>
            <ul className="text-xs leading-relaxed font-mono space-y-2">
              <li className="border-l-2 border-[var(--accent-color)] pl-2">
                <strong>/about</strong> - Interactive life journey game
              </li>
              <li className="border-l-2 border-[var(--accent-color)] pl-2">
                <strong>/work</strong> - Project showcase with pixel targets
              </li>
              <li className="border-l-2 border-[var(--accent-color)] pl-2">
                <strong>/arcade</strong> - Collection of mini games
              </li>
              <li className="border-l-2 border-[var(--accent-color)] pl-2">
                <strong>/contact</strong> - Bomb defusal game to contact me
              </li>
            </ul>
          </article>
        </section>

        {/* Footer - Pixel Grid */}
        <footer className="mt-8 pt-4 text-center">
          <div className="grid grid-cols-8 gap-1 mb-3 mx-auto max-w-md">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-card)]"></div>
            ))}
          </div>
          <p className="mb-2 text-xs font-mono">© {today.getFullYear()} The Daily Kiruk. All rights reserved.</p>
          <p className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
            Published from Bangalore, India | "Scribbles that turn into digital experiences"
          </p>
        </footer>
      </div>
    </div>
  );
}
