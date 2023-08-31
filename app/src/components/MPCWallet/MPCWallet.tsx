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

const messageOneAtom = atomWithStorage("messageOne", "");
const messageTwoAtom = atomWithStorage("messageTwo", "");
const messageThreeAtom = atomWithStorage("messageThree", "");
const messageDoneForTwoAtom = atomWithStorage("messageDoneForTwo", "");

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
  const {
    onCopy,
    setValue: setClipboardValue,
    hasCopied,
  } = useClipboard("");
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");
  const [currentStep, setCurrentStep] = useState<STEP>("step_0");
  const [currentPayload, setCurrentPayload] = useState<string>("");
  const [ipfsURL, setIPFSUrl] = useState<string>("");
  const [messageOne, setMessageOne] = useAtom(messageOneAtom);
  const [messageTwo, setMessageTwo] = useAtom(messageTwoAtom);
  const [messageThree, setMessageThree] = useAtom(messageThreeAtom);
  const [messageDoneForTwo, setMessageDoneForTwo] = useAtom(
    messageDoneForTwoAtom
  );
  const [keyshare, setKeyshare] = useState<
    JsonObject.JsonObject_KeyShare2 | JsonObject.JsonObject_KeyShare1
  >();

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

  const stepThree = async (messageTwo: string) => {
    console.log("(🔑,3️⃣) 🟠 Executing step three, you should be wallet-1");
    const dkgp1 = dkg as DKGP1;
    const message3 = await dkgp1.step2(messageTwo); // This might fail if we have lost the context
    console.log("(🔑,3️⃣) 🟢 Step three executed [message]", message3);
    return message3;
  };

  const stepFour = async (_messageThree: string) => {
    console.log("(🔑,4️⃣) 🟠 Executing step four, you should be wallet-2");
    const dkgp2 = dkg as DKGP2;
    const doneMessage = await dkgp2.step2(_messageThree); // This might fail if we have lost the context
    console.log("(🔑,4️⃣) 🟢 Step four executed [message]", doneMessage);
    const keyshare = dkgp2.exportKeyShare2();
    return { message: doneMessage, keyshare };
  };

  const stepFive = async (doneMessageForTwo: string) => {
    console.log("(🔑,5️⃣) 🟠 Executing step five, you should be wallet-1");
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
    };
    currentPayload && uploadPayloadToIPFS();
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
        <Text fontSize={"sm"}>Developer Tools</Text>
        <SimpleGrid columns={2} mt="5">
          <Text fontSize={'xs'}>Toggle Camera</Text>
          <IconButton
            size={'xs'}
            w="fit-content"
            mx="auto"
            icon={!enableQRScanner ? <ViewIcon /> : <ViewOffIcon />}
            onClick={() => setEnableQRScanner(!enableQRScanner)}
            aria-label="Toggle camera"
          />
        </SimpleGrid>
        <SimpleGrid columns={2} mt='2'>
          <Text fontSize={'xs'}>Copy QR code</Text>
          <IconButton
            size={'xs'}
            w="fit-content"
            mx="auto"
            icon={!hasCopied ? <CopyIcon /> : <CheckIcon />}
            onClick={() => onCopy()}
            aria-label="Copy QR code"
          />
        </SimpleGrid>
      </Box>
      <Flex flexDir={"column"} gap="2">
        {pub && <MPCValue label={"Pub Address"} value={pub} />}
        {messageOne && <MPCValue label="Message one" value={messageOne} />}
        {messageTwo && <MPCValue label="Message two" value={messageTwo} />}
        {messageThree && (
          <MPCValue label="Message three" value={messageThree} />
        )}
        {messageDoneForTwo && (
          <MPCValue label="Done message" value={messageDoneForTwo} />
        )}
        {keyshare && (
          <MPCValue
            label="Keyshare"
            value={deriveAddressFromCurvePoint(keyshare.Q.x, keyshare.Q.y)}
          />
        )}
        {currentPayload && ipfsURL && <QRCodeImage payload={ipfsURL} />}
        <Text letterSpacing={"10px"}>{getHash(currentPayload)}</Text>
        <Heading fontSize={"xl"} as="h3">
          Scanner
        </Heading>
        {instance == 1 && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_ONE_COMPLETED}
            onCompletionMessage="✅ Scanned pub key of Wallet 2"
            defaultMessage="1️⃣ Scan pubKey to start DKG handshake"
            onClickHandler={() => {
              setCurrentStep("step_1_1");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {instance == 1 && STEP_ONE_ONE_COMPLETED && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_TWO_COMPLETED}
            onCompletionMessage="✅ Scanned message from Wallet 2"
            defaultMessage="3️⃣ Scan signed message 2 to complete DKG"
            onClickHandler={() => {
              setCurrentStep("step_1_2");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {instance == 1 && STEP_ONE_TWO_COMPLETED && (
          <MPCButton
            hasBeenCompleted={!!keyshare}
            onCompletionMessage="✅ Scanned message and completed setup"
            defaultMessage="5️⃣ Scan done message from 2 to get key"
            onClickHandler={() => {
              setCurrentStep("step_1_3");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {instance == 2 && (
          <MPCButton
            hasBeenCompleted={STEP_TWO_ONE_COMPLETED}
            onCompletionMessage="✅ Scanned message one from Wallet 1"
            defaultMessage="2️⃣ Scan message one to agree DKG handshake"
            onClickHandler={() => {
              setCurrentStep("step_2_1");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {instance == 2 && STEP_TWO_ONE_COMPLETED && (
          <MPCButton
            hasBeenCompleted={STEP_TWO_TWO_COMPLETED}
            onCompletionMessage="✅ Scanned all messages needed from Wallet 1"
            defaultMessage="4️⃣ Scan last message to derive keyshare"
            onClickHandler={() => {
              setCurrentStep("step_2_2");
              setEnableQRScanner(!enableQRScanner);
            }}
          />
        )}
        {enableQRScanner && <QRScanner setBarcodeValue={setBarcodeValue} />}
      </Flex>
    </Flex>
  );
};
