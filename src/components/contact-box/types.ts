import type { ComponentType } from "react";
import type { Contact } from "./use-contact";

export interface ContactSkinProps {
  contact: Contact;
}

export type ContactSkin = ComponentType<ContactSkinProps>;
