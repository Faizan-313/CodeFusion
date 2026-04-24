import { createContext, useContext } from "react";

export const ProctoringContext = createContext(null);

export function useProctoringCtx() {
  const ctx = useContext(ProctoringContext);
  if (!ctx) {
    throw new Error("useProctoringCtx must be used inside <ProctoringProvider>");
  }
  return ctx;
}
