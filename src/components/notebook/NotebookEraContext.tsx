"use client";

import { createContext, useContext } from "react";

export interface NotebookEraContextValue {
  eraId: string;
  ready: boolean;
  pickEra: (id: string) => void;
}

export const NotebookEraContext = createContext<NotebookEraContextValue | undefined>(undefined);

export function useNotebookEra() {
  const context = useContext(NotebookEraContext);
  if (!context) {
    throw new Error("useNotebookEra must be used within NotebookEraProvider");
  }
  return context;
}

export function useNotebookEraOptional() {
  return useContext(NotebookEraContext);
}
