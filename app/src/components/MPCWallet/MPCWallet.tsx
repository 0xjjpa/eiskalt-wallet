import { Button, Code, Flex, Heading, useToast, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
const { getHash } = require("emoji-hash-gen");
import { DKGP1, DKGP2 } from "@safeheron/two-party-mpc-adapter";

import { abbreviate } from "../../helpers";
import { QRScanner } from "../QRScanner";
import { QRCodeImage } from "../QRCodeImage";

type STEP = "step_1" | "step_2" | "step_3";

export const MPCWallet = ({
  dkg,
  setPriv,
  setPub,
  pub,
  instance,
}: {
  dkg: DKGP1 | DKGP2;
  setPriv: (priv: string) => void;
  setPub: (pub: string) => void;
  pub: string;
  instance: number;
}) => {
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");
  const [currentStep, setCurrentStep] = useState<STEP>();
  const [currentPayload, setCurrentPayload] = useState<string>("");

  const stepOne = async (pub: string) => {
    console.log("(🔑,1️⃣) 🟠 Executing step one, you should be wallet-1");
    const dkgp1 = dkg as DKGP1;
    const message1 = await dkgp1.step1.call(dkg, pub);
    console.log("(🔑,1️⃣) 🟢 Step one executed [message]", message1);
    return message1;
  };

  useEffect(() => {
    const loadPayload = async () => {
      if (currentStep == 'step_1') {
        const message1 = await stepOne(qrPayload);
        const newPayload = [message1, pub].join(',')
        setCurrentPayload(newPayload);
      }
    };
    qrPayload && loadPayload();
  }, [currentStep, qrPayload]);

  useEffect(() => {
    pub && setCurrentPayload(pub);
  }, [pub])

  return (
    <Flex mt="2" textAlign={"center"} gap="10" flexDir={"column"}>
      {pub && (
        <Flex flexDir={"column"} gap="2">
          <Heading fontSize={"xl"} as="h3">
            Pub Address
          </Heading>
          <Code px="2" py="1">
            {abbreviate(pub)}
          </Code>
          <Text letterSpacing={'10px'}>{getHash(pub)}</Text>
          {currentPayload && <QRCodeImage payload={currentPayload} />}
          <Text letterSpacing={'10px'}>{getHash(currentPayload)}</Text>
          <Heading fontSize={"xl"} as="h3">
            Scanner
          </Heading>
          {instance == 1 && (
            <Button
              onClick={() => {
                setCurrentStep("step_1");
                setEnableQRScanner(!enableQRScanner);
              }}
            >
              📸 Scan pubKey to start DKG handshake
            </Button>
          )}
          {enableQRScanner && <QRScanner setBarcodeValue={setBarcodeValue} />}
        </Flex>
      )}
    </Flex>
  );
};
