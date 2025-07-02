import { useState } from "react";

export function useProgram() {
  // Placeholder: always connected
  const [connected] = useState(true);

  // Mock publicKey with toString method
  const publicKey = {
    toString: () => "0xMockWalletAddress1234567890abcdef",
  };

  // Mock submitManuscriptSubsidized function
  const submitManuscriptSubsidized = async () => {
    console.log("Mock submitManuscriptSubsidized called");
    return { success: true };
  };

  return {
    connected,
    publicKey,
    submitManuscriptSubsidized,
  };
}
