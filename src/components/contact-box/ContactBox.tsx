"use client";

/**
 * ContactBox — /contact, dressed for the active era. One engine
 * (useContact), one skin per era, same facts everywhere.
 */

import { useDesignEra } from "@/contexts/DesignEraContext";
import { getContactSkin } from "./registry";
import { useContact } from "./use-contact";

export function ContactBox() {
  const { currentEra } = useDesignEra();
  const contact = useContact();
  const Skin = getContactSkin(currentEra.id);

  return (
    <div
      className="relative min-h-screen pb-20 [&_button]:[font-family:inherit] [&_input]:[font-family:inherit] [&_select]:[font-family:inherit] [&_textarea]:[font-family:inherit]"
      style={{ backgroundColor: "var(--bg-main)", paddingTop: "var(--simple-game-nav-bottom, 4.5rem)" }}
    >
      <Skin contact={contact} />
    </div>
  );
}
