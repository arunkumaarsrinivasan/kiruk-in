import type { Metadata } from "next";
import { Harness } from "@/lab/maze-nav/Harness";

export const metadata: Metadata = {
  title: "Lab · Maze nav",
  robots: { index: false, follow: false },
};

export default function LabMazeNavPage() {
  return <Harness />;
}
