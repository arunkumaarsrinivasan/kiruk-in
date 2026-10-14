"use client";

import { ContactBox } from "@/components/contact-box/ContactBox";
import { EraHandoff } from "@/components/era-shell/EraHandoff";

export default function Contact() {
  return (
    <EraHandoff ask="contact">
      <ContactBox />
    </EraHandoff>
  );
}
