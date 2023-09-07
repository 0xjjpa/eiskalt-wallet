import {
  Button,
  Code,
  Flex,
  Heading,
  useToast,
  Text,
  Box,
  IconButton,
  useClipboard,
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
const { getHash } = require("emoji-hash-gen");
import {
  DKGP1,
  DKGP2,
  JsonObject,
  deriveAddressFromCurvePoint,
} from "@safeheron/two-party-mpc-adapter";

import { QRScanner } from "../QRScanner";
import { QRCodeImage } from "../QRCodeImage";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { MPCValue } from "./MPCValue";
import { MPCButton } from "./MPCButton";
import { CheckIcon, CopyIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { readFromIPFSURL, uploadJSONToIPFS } from "../../lib/ipfs";

type STEP =
  | "step_0"
  | "step_1_1"
  | "step_1_2"
  | "step_1_3"
  | "step_2_1"
  | "step_2_2";

const keyshareAtom = atomWithStorage("keyshare", "");

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
  const { onCopy, setValue: setClipboardValue, hasCopied } = useClipboard("");
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [enableDevTools, setEnableDevTools] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");
  const [currentStep, setCurrentStep] = useState<STEP>("step_0");
  const [currentPayload, setCurrentPayload] = useState<string>("");
  const [ipfsURL, setIPFSUrl] = useState<string>("");
  const [hasLoadedIPFSUrl, setHasLoadedIPFSUrl] = useState(false);
  const [messageOne, setMessageOne] = useState("");
  const [messageTwo, setMessageTwo] = useState("");
  const [messageThree, setMessageThree] = useState("");
  const [messageDoneForTwo, setMessageDoneForTwo] = useState("");
  const [keyshare, setKeyshare] = useState<
    JsonObject.JsonObject_KeyShare2 | JsonObject.JsonObject_KeyShare1
  >();
  const [storedKeyshare, setStoredKeyshare] = useAtom(keyshareAtom);

  const stepOne = async (pub: string) => {
    console.log("(🔑,1️⃣) 🟠 Executing step one, you should be computer");
    const dkgp1 = dkg as DKGP1;
    const message1 = await dkgp1.step1(pub); // This might fail if we have lost the context
    console.log("(🔑,1️⃣) 🟢 Step one executed [message]", message1);
    return message1;
  };

  const stepTwo = async (_messageOne: string, pub: string) => {
    console.log("(🔑,2️⃣) 🟠 Executing step two, you should be mobile");
    const dkgp2 = dkg as DKGP2;
    const message2 = await dkgp2.step1(_messageOne, pub); // This might fail if we have lost the context
    console.log("(🔑,2️⃣) 🟢 Step two executed [message]", message2);
    return message2;
  };

  const stepThree = async (messageTwo: string) => {
    console.log("(🔑,3️⃣) 🟠 Executing step three, you should be computer");
    const dkgp1 = dkg as DKGP1;
    const message3 = await dkgp1.step2(messageTwo); // This might fail if we have lost the context
    console.log("(🔑,3️⃣) 🟢 Step three executed [message]", message3);
    return message3;
  };

  const stepFour = async (_messageThree: string) => {
    console.log("(🔑,4️⃣) 🟠 Executing step four, you should be mobile");
    const dkgp2 = dkg as DKGP2;
    const doneMessage = await dkgp2.step2(_messageThree); // This might fail if we have lost the context
    console.log("(🔑,4️⃣) 🟢 Step four executed [message]", doneMessage);
    const keyshare = dkgp2.exportKeyShare2();
    return { message: doneMessage, keyshare };
  };

  const stepFive = async (doneMessageForTwo: string) => {
    console.log("(🔑,5️⃣) 🟠 Executing step five, you should be computer");
    const dkgp1 = dkg as DKGP1;
    const keyshare = await dkgp1.step3(doneMessageForTwo); // This might fail if we have lost the context
    console.log("(🔑,5️⃣) 🟢 Step five executed, no more messages");
    return { keyshare };
  };

  const STEP_ONE_ONE_COMPLETED = messageOne.length > 0;
  const STEP_TWO_ONE_COMPLETED = messageTwo.length > 0;
  const STEP_ONE_TWO_COMPLETED = messageThree.length > 0;
  const STEP_TWO_TWO_COMPLETED = messageDoneForTwo.length > 0;

  useEffect(() => {
    const loadPayload = async (qrPayloadAsIPFSUrl: string) => {
      setEnableQRScanner(false);
      const response = await readFromIPFSURL(qrPayloadAsIPFSUrl);
      const qrPayload = response.message;
      console.log("(📸,📦) Payload found.", qrPayload);
      if (currentStep == "step_1_1") {
        const message = await stepOne(qrPayload);
        const newPayload = [message, pub].join(",");
        setMessageOne(message);
        setCurrentPayload(newPayload);
      }
      if (currentStep == "step_1_2") {
        const message = await stepThree(qrPayload);
        setMessageThree(message);
        setCurrentPayload(message);
      }
      if (currentStep == "step_1_3") {
        const { keyshare } = await stepFive(qrPayload);
        setKeyshare(keyshare);
        setStoredKeyshare(JSON.stringify(keyshare));
      }
      if (currentStep == "step_2_1") {
        const [_messageOne, pub] = qrPayload.split(",");
        const message = await stepTwo(_messageOne, pub);
        setMessageTwo(message);
        setCurrentPayload(message);
      }
      if (currentStep == "step_2_2") {
        const { message, keyshare } = await stepFour(qrPayload);
        setMessageDoneForTwo(message);
        setCurrentPayload(message);
        setKeyshare(keyshare);
        setStoredKeyshare(JSON.stringify(keyshare));
      }
    };
    qrPayload && loadPayload(qrPayload);
  }, [currentStep, qrPayload]);

  useEffect(() => {
    pub && setCurrentPayload(pub);
  }, [pub]);

  useEffect(() => {
    const uploadPayloadToIPFS = async () => {
      const ipfsURL = await uploadJSONToIPFS({ message: currentPayload });
      setIPFSUrl(ipfsURL);
      setClipboardValue(ipfsURL);
      setHasLoadedIPFSUrl(true);
    };
    currentPayload && uploadPayloadToIPFS();
    return () => {
      setHasLoadedIPFSUrl(false);
    };
  }, [currentPayload]);

  useEffect(() => {
    setMessageOne("");
    setMessageTwo("");
    setMessageThree("");
    setMessageDoneForTwo("");
  }, [priv]);

  return (
    <Flex mt="2" textAlign={"center"} gap="10" flexDir={"column"}>
      <Box>
        <Text
          fontSize={"sm"}
          fontFamily={"mono"}
          onClick={() => setEnableDevTools(!enableDevTools)}
        >
          Developer Tools
        </Text>
        {enableDevTools && (
          <>
            <Text fontSize={"xs"}>
              There are a couple of issues you might see. If the camera isn't
              showing properly, you can always toggle it on and off manually.
              Additionally, you can always double check what you are scanning
              with your phone.
            </Text>
            <SimpleGrid columns={2} mt="5">
              <Text fontSize={"xs"}>Toggle Camera</Text>
              <IconButton
                size={"xs"}
                w="fit-content"
                mx="auto"
                icon={!enableQRScanner ? <ViewIcon /> : <ViewOffIcon />}
                onClick={() => setEnableQRScanner(!enableQRScanner)}
                aria-label="Toggle camera"
              />
            </SimpleGrid>
            <SimpleGrid columns={2} mt="2">
              <Text fontSize={"xs"}>Copy QR code</Text>
              <IconButton
                size={"xs"}
                w="fit-content"
                mx="auto"
                icon={!hasCopied ? <CopyIcon /> : <CheckIcon />}
                onClick={() => onCopy()}
                aria-label="Copy QR code"
              />
            </SimpleGrid>
          </>
        )}
      </Box>
      <Flex flexDir={"column"} gap="2">
        {pub && (
          <MPCValue
            label={"Public Address"}
            explanation={`
              Our DKG algorithm derives a set of private and public keypairs to start
              the exchange of data information. The public key is the first part of this
              procedure, and it’s needed for our second device to proceed.
            `}
            value={pub}
            description="Initial public key &nbsp;"
          />
        )}
        {messageOne && (
          <MPCValue
            label="Message one"
            value={messageOne}
            emoji="💻"
            description="Generated in 💻 and to be scanned by 📱"
          />
        )}
        {messageTwo && (
          <MPCValue
            label="Message two"
            value={messageTwo}
            emoji="📱"
            description="Generated in 📱 and to scan by 💻"
          />
        )}
        {messageThree && (
          <MPCValue
            label="Message three"
            value={messageThree}
            emoji="💻"
            description="Generated in 💻 and to be scanned by 📱"
          />
        )}
        {messageDoneForTwo && (
          <MPCValue
            label="Done message"
            value={messageDoneForTwo}
            emoji="📱"
            description="Generated in 📱 and to be scanned by 💻"
          />
        )}
        {keyshare && (
          <MPCValue
            label="Keyshare"
            value={deriveAddressFromCurvePoint(keyshare.Q.x, keyshare.Q.y)}
          />
        )}
        {currentPayload && ipfsURL && (
          <Skeleton isLoaded={hasLoadedIPFSUrl}>
            <QRCodeImage payload={ipfsURL} />
          </Skeleton>
        )}
        <Text letterSpacing={"10px"}>{getHash(currentPayload)}</Text>
        {pub && instance == 1 && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_ONE_COMPLETED}
            onCompletionMessage="✅ Scanned pub key of Wallet 2"
            defaultMessage="1️⃣ Scan 📱's QR code to start DKG"
            onClickHandler={() => {
              setCurrentStep("step_1_1");
              setEnableQRScanner(true);
            }}
          />
        )}
        {instance == 1 && STEP_ONE_ONE_COMPLETED && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_TWO_COMPLETED}
            onCompletionMessage="✅ Scanned message from Wallet 2"
            defaultMessage="3️⃣ Scan 📱's signed QR code to continue DKG"
            onClickHandler={() => {
              setCurrentStep("step_1_2");
              setEnableQRScanner(true);
            }}
          />
        )}
        {instance == 1 && STEP_ONE_TWO_COMPLETED && (
          <MPCButton
            hasBeenCompleted={!!keyshare}
            onCompletionMessage="✅ DKG message and completed setup"
            defaultMessage="5️⃣ Scan 📱's last QR code to complet DKG setup"
            onClickHandler={() => {
              setCurrentStep("step_1_3");
              setEnableQRScanner(true);
            }}
          />
        )}
        {pub && instance == 2 && (
          <MPCButton
            hasBeenCompleted={STEP_TWO_ONE_COMPLETED}
            onCompletionMessage="✅ Scanned message one from 📱"
            defaultMessage="2️⃣ Scan 💻's QR code to continue"
            onClickHandler={() => {
              setCurrentStep("step_2_1");
              setEnableQRScanner(true);
            }}
          />
        )}
        {instance == 2 && STEP_TWO_ONE_COMPLETED && (
          <MPCButton
            hasBeenCompleted={STEP_TWO_TWO_COMPLETED}
            onCompletionMessage="✅ DKG Generation completed on 📱"
            defaultMessage="4️⃣ Scan 💻's last QR code to complete DKG"
            onClickHandler={() => {
              setCurrentStep("step_2_2");
              setEnableQRScanner(true);
            }}
          />
        )}
        {enableQRScanner && <QRScanner setBarcodeValue={setBarcodeValue} />}
      </Flex>
    </Flex>
  );
};
