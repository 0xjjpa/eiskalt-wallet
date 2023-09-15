import { Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { mpcSDK } from "../../lib/mpc";
import { Supabase } from "../../lib/supabase";

export const MPCSign = ({
  sessionId,
  instance,
  channel
}: {
  sessionId: string;
  instance: 1 | 2;
  channel: Supabase
}) => {
  const handleCosignature = async () => {
    console.log("(🖊️,ℹ️) Starting co-signature...");
    mpcSDK({
      id: sessionId,
      step: "step_0",
      payload: "Initial handshake",
      instance,
      endpoint: "sign",
      client: "supabase",
      channel
    });
  };
  return (
    <Button onClick={handleCosignature}>🖊️ Co-sign demo transaction</Button>
  );
};
