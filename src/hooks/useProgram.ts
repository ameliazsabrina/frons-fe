import { useState } from "react";

export function useProgram() {
  // Placeholder: always connected
  const [connected] = useState(true);
  return { connected };
}
