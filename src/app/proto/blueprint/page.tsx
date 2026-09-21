import type { Metadata } from "next";
import { Harness } from "@/proto/blueprint/Harness";

export const metadata: Metadata = {
  title: "Proto · era-travel blueprint",
  robots: { index: false, follow: false },
};

export default function ProtoBlueprintPage() {
  return <Harness />;
}
