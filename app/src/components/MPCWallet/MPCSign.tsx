import {
  Box,
  Button,
  CircularProgress,
  CircularProgressLabel,
  Link,
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

export const useTransactionStore = create<{ rawTransaction: string }>()(() => ({
  rawTransaction: "",
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
  const rawTransaction = useTransactionStore((state) => state.rawTransaction);
  const [txHash, setTxHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const submitSignature = async () => {
    console.log("(📢,ℹ️) Starting faucet + submission...");
    setIsLoading(true);
    const faucetHashresponse = await mpcSDK({
      id: sessionId,
      step: "step_0",
      payload: rawTransaction,
      instance,
      endpoint: "faucet",
    });
    console.log("(📢,ℹ️) Completed faucet, txHash = ", faucetHashresponse);

    const txHashresponse = await mpcSDK({
      id: sessionId,
      step: "step_0",
      payload: rawTransaction,
      instance,
      endpoint: "submit",
    });
    setTxHash(txHashresponse.transactionHash);
    setIsLoading(false);
    console.log("(📢,ℹ️) Completed submission, txHash = ", txHash);
  };

  const SubmissionNode =
    txHash.length > 0 ? (
      <Text fontSize={"xs"}>
        ✅ Success! Submitted transaction, see receipt{" "}
        <Link target="_blank" href={`https://hashscan.io/previewnet/transaction/${txHash}`}>
          here
        </Link>
      </Text>
    ) : (
      <Button isLoading={isLoading} onClick={submitSignature}>📢 Submit demo transaction</Button>
    );

  return (
    <Box>
      {instance == 2 ? (
        <Button onClick={handleCosignature}>🖊️ Co-sign demo transaction</Button>
      ) : (
        <Text fontSize={"xs"}>Start the signature from 📱</Text>
      )}
      {instance == 1 && rawTransaction.length > 0 && SubmissionNode}
      <CircularProgress
        value={instance == 1 ? (status * 100) / 30 : (status * 100) / 20}
        color="green.400"
      >
        <CircularProgressLabel>
          {instance == 1
            ? ((status * 100) / 30).toFixed(0)
            : ((status * 100) / 20).toFixed(0)}
          %
        </CircularProgressLabel>
      </CircularProgress>
    </Box>
  );
};
