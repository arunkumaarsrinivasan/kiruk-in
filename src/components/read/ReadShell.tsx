/**
 * The frame every Read page shares (docs/READ_DIRECTORY_PLAN.md): a rail that
 * says where you are, then the page. It draws inside whatever reading surface
 * the route already has, in the era's tokens.
 */
import Link from "next/link";
import type { ReactNode } from "react";
import { ReadCursor } from "./ReadCursor";
import "./read.css";

export interface RailItem {
  label: string;
  href: string;
  /** A count or a section number, set at the right edge. */
  n?: string;
  current?: boolean;
}

export interface RailGroup {
  /** For assistive tech. */
  label: string;
  /** A small heading over the group, when it needs one. */
  title?: string;
  /** Detail for wide screens only: on a phone the rail keeps just the shelves. */
  deep?: boolean;
  items: RailItem[];
}

export function ReadShell({ rail, children }: { rail: RailGroup[]; children: ReactNode }) {
  return (
    <div className="read">
      <ReadCursor />
      <nav className="read-rail" aria-label="Read">
        {rail.map((g) => (
          <div key={g.label} className={`read-rail__group${g.deep ? " read-rail__group--deep" : ""}`} role="group" aria-label={g.label}>
            {g.title ? <p className="read-label read-rail__title">{g.title}</p> : null}
            <ul>
              {g.items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} aria-current={item.current ? "page" : undefined}>
                    <span>{item.label}</span>
                    {item.n ? <span className="read-rail__n">{item.n}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="read-main">{children}</div>
    </div>
  );
}
