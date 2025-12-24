'use client';

import React from 'react';
import { portfolioData } from '@/data/portfolio-data';

const jobOpportunities = [
  {
    id: 1,
    title: 'Creative Developer',
    company: 'Product Company',
    location: 'Bangalore / Remote',
    type: 'Full-time',
    match: '95%',
    status: 'Hot',
    skills: 'React, Design Systems, Creative Coding'
  },
  {
    id: 2,
    title: 'Frontend or UX Design Engineer',
    company: 'Tech Startup',
    location: 'Bangalore',
    type: 'Full-time',
    match: '92%',
    status: 'New',
    skills: 'React, UX Design, TypeScript, Figma'
  },
  {
    id: 3,
    title: 'AX or Product Designer',
    company: 'AI Company',
    location: 'Remote',
    type: 'Full-time',
    match: '90%',
    status: 'Active',
    skills: 'AI/UX Design, Product Design, Design Systems'
  },
];

export default function JobNews() {
  return (
    <section className="mb-6">
      <div className="bg-[var(--accent-color)] p-3 mb-4">
        <h2 className="text-xl md:text-2xl font-mono font-bold uppercase text-[var(--bg-main)] flex items-center gap-2">
          <span>💼</span> JOB MARKET NEWS
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jobOpportunities.map((job, index) => (
          <article 
            key={job.id}
            className={`p-4 bg-[var(--bg-card)]`}
          >
            <div className="grid grid-cols-2 gap-1 mb-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
              ))}
            </div>
            <div className="flex items-start justify-between mb-2">
              <div className="bg-[var(--accent-color)] px-2 py-1">
                <span className="font-mono font-bold text-[10px] uppercase text-[var(--bg-main)]">{job.status}</span>
              </div>
              <div className="bg-[var(--bg-main)] px-2 py-1">
                <span className="font-mono font-bold text-[10px] uppercase">{job.match} MATCH</span>
              </div>
            </div>
            <h3 className="font-mono font-bold text-sm mb-2 uppercase">{job.title}</h3>
            <div className="space-y-1 text-xs font-mono mb-3">
              <div><strong>Company:</strong> {job.company}</div>
              <div><strong>Location:</strong> {job.location}</div>
              <div><strong>Type:</strong> {job.type}</div>
            </div>
            <div className="border-t border-[var(--border-color)] pt-2">
              <div className="text-[10px] font-mono text-[var(--text-muted)]">
                Skills: {job.skills}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Current Status - Pixel Grid */}
      <article className="p-4 bg-[var(--bg-card)] mt-4">
        <div className="grid grid-cols-3 gap-1 mb-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-1 border border-[var(--border-color)] bg-[var(--bg-main)]"></div>
          ))}
        </div>
        <h3 className="font-mono font-bold text-sm mb-2 uppercase">CURRENT STATUS</h3>
        <div className="text-xs font-mono space-y-1">
          <div className="border-l-2 border-[var(--accent-color)] pl-2">
            <strong>Position:</strong> Software Development Engineer 1 at HP Inc
          </div>
          <div className="border-l-2 border-[var(--accent-color)] pl-2">
            <strong>Availability:</strong> {portfolioData.contact.availability === 'available' ? 'Open to opportunities' : 'Currently employed'}
          </div>
          <div className="border-l-2 border-[var(--accent-color)] pl-2">
            <strong>Preferred Contact:</strong> {portfolioData.contact.preferredContact}
          </div>
          <div className="border-l-2 border-[var(--accent-color)] pl-2">
            <strong>Response Time:</strong> {portfolioData.contact.responseTime}
          </div>
          <div className="border-l-2 border-[var(--accent-color)] pl-2">
            <strong>Focus:</strong> Working with creative minds, building from 0 to 1
          </div>
        </div>
      </article>
    </section>
  );
}
