"use client";

/** Contact module → the real /contact experience (typing game → telephone /
 * channels). Opens fullscreen from the Contact trigger; Close/Esc dismisses. */

import React from "react";
import dynamic from "next/dynamic";

const ContactPage = dynamic(() => import("@/app/contact/page"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full w-full items-center justify-center text-sm"
      style={{ color: "var(--text-muted)", fontFamily: "var(--font-main)" }}
    >
      ✉ dialing in…
    </div>
  ),
});

export function ContactExperience() {
  return (
    <div className="relative h-full w-full overflow-y-auto">
      <ContactPage />
    </div>
  );
}

export default ContactExperience;
