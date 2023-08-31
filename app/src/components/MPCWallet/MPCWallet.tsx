import { Button, Code, Flex, Heading, useToast, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
const { getHash } = require("emoji-hash-gen");
import { DKGP1, DKGP2 } from "@safeheron/two-party-mpc-adapter";

import { abbreviate } from "../../helpers";
import { QRScanner } from "../QRScanner";
import { QRCodeImage } from "../QRCodeImage";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { MPCValue } from "./MPCValue";
import { MPCButton } from "./MPCButton";

type STEP = "step_0" | "step_1_1" | "step_1_2" | "step_2_1" | "step_2_2";

const messageOneAtom = atomWithStorage("messageOne", "");
const messageTwoAtom = atomWithStorage("messageTwo", "");
const messageThreeAtom = atomWithStorage("messageThree", "");

export const MPCWallet = ({
  dkg,
  priv,
  pub,
  instance,
}: {
  dkg: DKGP1 | DKGP2;
  priv: string;
  pub: string;
  instance: number;
}) => {
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");
  const [currentStep, setCurrentStep] = useState<STEP>("step_0");
  const [currentPayload, setCurrentPayload] = useState<string>("");
  const [messageOne, setMessageOne] = useAtom(messageOneAtom);
  const [messageTwo, setMessageTwo] = useAtom(messageTwoAtom);
  const [messageThree, setMessageThree] = useAtom(messageThreeAtom);

  const stepOne = async (pub: string) => {
    console.log("(🔑,1️⃣) 🟠 Executing step one, you should be wallet-1");
    const dkgp1 = dkg as DKGP1;
    const message1 = await dkgp1.step1(pub); // This might fail if we have lost the context
    console.log("(🔑,1️⃣) 🟢 Step one executed [message]", message1);
    return message1;
  };

  const stepTwo = async (_messageOne: string, pub: string) => {
    console.log("(🔑,2️⃣) 🟠 Executing step two, you should be wallet-2");
    const dkgp2 = dkg as DKGP2;
    const message2 = await dkgp2.step1(_messageOne, pub); // This might fail if we have lost the context
    console.log("(🔑,2️⃣) 🟢 Step two executed [message]", message2);
    return message2;
  };

  const STEP_ONE_ONE_COMPLETED = messageOne.length > 0;
  const STEP_TWO_ONE_COMPLETED = messageTwo.length > 0;
  const STEP_ONE_TWO_COMPLETED = messageThree.length > 0;

  useEffect(() => {
    const loadPayload = async () => {
      console.log("(📸,📦) Payload found.", qrPayload);
      if (currentStep == "step_1_1") {
        const message = await stepOne(qrPayload);
        const newPayload = [message, pub].join(",");
        setMessageOne(message);
        setCurrentPayload(newPayload);
      }
      if (currentStep == "step_2_1") {
        const [_messageOne, pub] = qrPayload.split(",");
        const message = await stepTwo(_messageOne, pub);
        setMessageTwo(message);
        setCurrentPayload(message);
      }
    };
    qrPayload && loadPayload();
  }, [currentStep, qrPayload]);

  useEffect(() => {
    pub && setCurrentPayload(pub);
  }, [pub]);

  useEffect(() => {
    setMessageOne("");
    setMessageTwo("");
  }, [priv]);

  return (
    <Flex mt="2" textAlign={"center"} gap="10" flexDir={"column"}>
      <Flex flexDir={"column"} gap="2">
        {pub && <MPCValue label={"Pub Address"} value={pub} />}
        {messageOne && <MPCValue label="Message one" value={messageOne} />}
        {messageTwo && <MPCValue label="Message two" value={messageTwo} />}
        {currentPayload && <QRCodeImage payload={currentPayload} />}
        <Text letterSpacing={"10px"}>{getHash(currentPayload)}</Text>
        <Heading fontSize={"xl"} as="h3">
          Scanner
        </Heading>
        {instance == 1 && currentStep == "step_0" && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_ONE_COMPLETED}
            onCompletionMessage="✅ Scanned pub key of Wallet 2"
            defaultMessage="📸 Scan pubKey to start DKG handshake"
            onClickHandler={() => {
              setCurrentStep("step_1_1");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {instance == 1 && currentStep == "step_1_1" && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_TWO_COMPLETED}
            onCompletionMessage="✅ Scanned message from Wallet 2"
            defaultMessage="📸 Scan pubKey to start DKG handshake"
            onClickHandler={() => {
              setCurrentStep("step_1_2");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {instance == 2 && (
          <MPCButton
            hasBeenCompleted={STEP_TWO_ONE_COMPLETED}
            onCompletionMessage="✅ Scanned message one from Wallet 1"
            defaultMessage="📸 Scan message one to agree DKG handshake"
            onClickHandler={() => {
              setCurrentStep("step_2_1");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {enableQRScanner && <QRScanner setBarcodeValue={setBarcodeValue} />}
      </Flex>
    </Flex>
  );
};
