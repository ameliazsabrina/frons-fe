import { useCallback } from "react";

export function useToast() {
  // For now, just use alert as a placeholder
  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      alert(`[${type.toUpperCase()}] ${message}`);
    },
    []
  );
  return { showToast };
}
