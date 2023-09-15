import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Text,
} from "@chakra-ui/react";
import { JsonObject, Encryptor } from "@safeheron/two-party-mpc-adapter";
import { PubCurveBasePoint } from "@safeheron/two-party-mpc-adapter/dist/enc/Encryptor";
import type BN from "bn.js";
import { curve } from "elliptic";

import { mpcSDK } from "../../lib/mpc";
import { Supabase } from "../../lib/supabase";
import { STEP } from "./MPCWallet";
import { useEffect, useState } from "react";
import { cosignerHandler } from "../../lib/pusher";

import { create } from "zustand";

export const useStatusStore = create<{ status: number }>()(() => ({
  status: 0,
}));

export const MPCSign = ({
  sessionId,
  instance,
  channel,
  keyshare,
}: {
  sessionId: string;
  instance: 1 | 2;
  channel: Supabase;
  keyshare: JsonObject.JsonObject_KeyShare2 | JsonObject.JsonObject_KeyShare1;
}) => {
  const [privKey, setPrivKey] = useState<BN>();
  const [pubKey, setPubKey] = useState<PubCurveBasePoint>();
  const status = useStatusStore((state) => state.status);

  useEffect(() => {
    console.log(`(🔌,ℹ️ ) Listening to client on instance ${instance}`);
    privKey &&
      channel.listen(
        "sign",
        cosignerHandler({ instance, privKey, keyshare, pubKey, channel })
      );
  }, [privKey]);

  useEffect(() => {
    const generateKeys = async () => {
      const { priv, pub } = await Encryptor.generateKeyPaire();
      setPrivKey(priv);
      setPubKey(pub);

      console.log("(🔑,ℹ️) PubKey generated", pub);
    };
    generateKeys();
    return () => {
      setPrivKey(null);
      setPubKey(null);
    };
  }, []);

  const generatePayload = (step: STEP) => {
    switch (step) {
      case "step_0":
        return JSON.stringify({
          x: pubKey.getX().toString("hex"),
          y: pubKey.getY().toString("hex"),
        });
      default:
        console.log(`(📦,ℹ️) Step ${step} has no been defined.`);
    }
  };

  const handleCosignature = async () => {
    console.log("(🖊️,ℹ️) Starting co-signature...");
    const payload = generatePayload("step_0");
    console.log("First step", payload);
    mpcSDK({
      id: sessionId,
      step: "step_0",
      payload,
      instance,
      endpoint: "sign",
      client: "supabase",
      channel,
    });
  };
  return (
    <Box>
      {instance == 2 ? (
        <Button onClick={handleCosignature}>🖊️ Co-sign demo transaction</Button>
      ) : (
        <Text fontSize={"xs"}>Start the signature from 📱</Text>
      )}
      <CircularProgress value={status} color="green.400">
        <CircularProgressLabel>{status}%</CircularProgressLabel>
      </CircularProgress>
    </Box>
  );
};
