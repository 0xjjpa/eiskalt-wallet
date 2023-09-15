import { Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { mpcSDK } from "../../lib/mpc";

export const MPCSign = ({
  sessionId,
  instance,
}: {
  sessionId: string;
  instance: 1 | 2;
}) => {
  const handleCosignature = async () => {
    console.log("(🖊️,ℹ️) Starting co-signature...");
    mpcSDK({
      id: sessionId,
      step: "step_0",
      payload: "Initial handshake",
      instance,
      endpoint: "sign",
    });
  };
  return (
    <Button onClick={handleCosignature}>🖊️ Co-sign demo transaction</Button>
  );
};
