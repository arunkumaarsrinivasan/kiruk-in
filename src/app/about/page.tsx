import { permanentRedirect } from "next/navigation";

/** About lives on every era's home page now; old links land on the story box. */
export default function About() {
  permanentRedirect("/#about");
}
