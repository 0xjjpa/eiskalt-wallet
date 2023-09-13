import {
  Flex,
  Text,
  Box,
  IconButton,
  useClipboard,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  DKGP1,
  DKGP2,
  JsonObject,
  deriveAddressFromCurvePoint,
} from "@safeheron/two-party-mpc-adapter";
const { getHash } = require("emoji-hash-gen");

import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { MPCValue } from "./MPCValue";
import { MPCButton } from "./MPCButton";
import { CheckIcon, CopyIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { readFromIPFSURL, uploadJSONToIPFS } from "../../lib/ipfs";
import { mpcSDK } from "../../lib/mpc";
import { abbreviate } from "../../helpers";

export type STEP =
  | "step_0"
  | "step_1_1"
  | "step_1_2"
  | "step_1_3"
  | "step_2_1"
  | "step_2_2";

const keyshareAtom = atomWithStorage("keyshare", "");

export const MPCWallet = ({
  id,
  dkg,
  priv,
  pub,
  instance,
  socketPayload,
  setSocketPayload,
}: {
  id: string;
  dkg: DKGP1 | DKGP2;
  priv: string;
  pub: string;
  instance: number;
  socketPayload: string
  setSocketPayload: (payload: string) => void
}) => {
  const { onCopy, hasCopied } = useClipboard("");
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [enableDevTools, setEnableDevTools] = useState(false);
  const [currentStep, setCurrentStep] = useState<STEP>("step_0");
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
    console.log("(🔑,1️⃣) 🟠 Executing step one, you should be computer", pub);
    const dkgp1 = dkg as DKGP1;
    const message1 = await dkgp1.step1(pub); // This might fail if we have lost the context
    console.log("(🔑,1️⃣) 🟢 Step one executed [message]", message1);
    return message1;
  };

  const stepTwo = async (_messageOne: string, pub: string) => {
    console.log("(🔑,2️⃣) 🟠 Executing step two, you should be mobile", _messageOne, pub);
    const dkgp2 = dkg as DKGP2;
    const message2 = await dkgp2.step1(_messageOne, pub); // This might fail if we have lost the context
    console.log("(🔑,2️⃣) 🟢 Step two executed [message]", message2);
    return message2;
  };

  const stepThree = async (_messageTwo: string) => {
    console.log("(🔑,3️⃣) 🟠 Executing step three, you should be computer", _messageTwo);
    const dkgp1 = dkg as DKGP1;
    const message3 = await dkgp1.step2(_messageTwo); // This might fail if we have lost the context
    console.log("(🔑,3️⃣) 🟢 Step three executed [message]", message3);
    return message3;
  };

  const stepFour = async (_messageThree: string) => {
    console.log("(🔑,4️⃣) 🟠 Executing step four, you should be mobile", _messageThree);
    const dkgp2 = dkg as DKGP2;
    const doneMessage = await dkgp2.step2(_messageThree); // This might fail if we have lost the context
    console.log("(🔑,4️⃣) 🟢 Step four executed [message]", doneMessage);
    const keyshare = dkgp2.exportKeyShare2();
    return { message: doneMessage, keyshare };
  };

  const stepFive = async (_doneMessageForTwo: string) => {
    console.log("(🔑,5️⃣) 🟠 Executing step five, you should be computer", _doneMessageForTwo);
    const dkgp1 = dkg as DKGP1;
    const keyshare = await dkgp1.step3(_doneMessageForTwo); // This might fail if we have lost the context
    console.log("(🔑,5️⃣) 🟢 Step five executed, no more messages");
    return { keyshare };
  };

  const STEP_ONE_ONE_COMPLETED = messageOne.length > 0;
  const STEP_TWO_ONE_COMPLETED = messageTwo.length > 0;
  const STEP_ONE_TWO_COMPLETED = messageThree.length > 0;
  const STEP_TWO_TWO_COMPLETED = messageDoneForTwo.length > 0;

  useEffect(() => {
    socketPayload != "" && console.log('(🔌,ℹ️) New payload obtained', socketPayload);
  }, [socketPayload])

  useEffect(() => {
    const uploadPayloadToIPFS = async () => {
      console.log("(📦,ℹ️) Current payload", socketPayload);
      const ipfsURL = await uploadJSONToIPFS({ message: socketPayload });
      setIPFSUrl(ipfsURL);
      setHasLoadedIPFSUrl(true);
    };
    socketPayload && uploadPayloadToIPFS();
    return () => {
      setHasLoadedIPFSUrl(false);
    };
  }, [socketPayload]);


  useEffect(() => {
    const loadPayload = async (socketPayloadAsIPFSUrl: string) => {
      const response = await readFromIPFSURL(socketPayloadAsIPFSUrl);
      const socketPayload = response.message;
      console.log("(#️⃣,ℹ️) Hash for payload", getHash(socketPayload));
      console.log("(📸,📦) Payload found.", socketPayload);
      if (currentStep == "step_1_1") {
        const message = await stepOne(socketPayload);
        const newPayload = [message, pub].join(",");
        setMessageOne(message);
        mpcSDK({ id, instance, payload: newPayload, step: "step_1_1" })
      }
      if (currentStep == "step_1_2") {
        const message = await stepThree(socketPayload)
        setMessageThree(message);
        const response = await mpcSDK({ id, instance, payload: message, step: "step_1_2" })
        console.log("(Response)", response)
      }
      if (currentStep == "step_1_3") {
        const { keyshare } = await stepFive(socketPayload);
        setKeyshare(keyshare);
        setStoredKeyshare(JSON.stringify(keyshare));
      }
      if (currentStep == "step_2_1") {
        const [_messageOne, pub] = socketPayload.split(",");
        const message = await stepTwo(_messageOne, pub);
        setMessageTwo(message);
        mpcSDK({ id, instance, payload: message, step: "step_2_1" })
      }
      if (currentStep == "step_2_2") {
        const { message, keyshare } = await stepFour(socketPayload);
        setMessageDoneForTwo(message);
        setKeyshare(keyshare);
        setStoredKeyshare(JSON.stringify(keyshare));
        mpcSDK({ id, instance, payload: message, step: "step_2_2" })
      }
    };
    socketPayload && ipfsURL && loadPayload(ipfsURL);
  }, [currentStep]);

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
          cursor={"pointer"}
          textDecoration={"underline"}
          textUnderlineOffset={"5px"}
          mb="2"
        >
          Developer Tools
        </Text>
        {enableDevTools && (
          <>
            <Text fontSize={"xs"} mb="2">
              Use these “Developer Tools” to debug any issue with the
              application. We use emoji hashes (e.g., ✅, 💻, 📦) to help you
              visualize what content each payload has, and to ensure each device
              has gotten the expected payload from the other device.
            </Text>
            <Text fontSize={"xs"}>
              There are a couple of issues you might see. If the emojis you see
              here doesn’t match what you see in the other devices, some data
              might had been sent incorrectly, and you need to refresh the app.
            </Text>
            <SimpleGrid columns={2} mt="5">
              <Text fontSize={"xs"}>Session</Text>
              <Text fontSize={"xs"} fontFamily={'mono'}>{id ? abbreviate(id) : "No session"}</Text>
            </SimpleGrid>
            <SimpleGrid columns={2} mt="2">
              <Text fontSize={"xs"}>Payload session</Text>
              <Text fontSize={"xs"}>{id ? getHash(id) : "No session"}</Text>
            </SimpleGrid>
            <SimpleGrid columns={2} mt="2">
              <Text fontSize={"xs"}>Current payload</Text>
              <Text fontSize={"xs"} fontFamily={'mono'}>{socketPayload ? abbreviate(socketPayload) : "No payload"}</Text>
            </SimpleGrid>
            <SimpleGrid columns={2} mt="2">
              <Text fontSize={"xs"}>Payload hash</Text>
              <Text fontSize={"xs"}>{socketPayload ? getHash(socketPayload) : "No payload"}</Text>
            </SimpleGrid>
          </>
        )}
      </Box>
      <Flex flexDir={"column"} gap="2">
        {pub && (
          <MPCValue
            label={"Public Address"}
            explanation={`
              Our DKG algorithm derived a set of private and public keypairs to start
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
            description="Generated in 📱 and to be scanned by 💻"
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
        {pub && instance == 1 && (
          <MPCButton
            hasBeenCompleted={STEP_ONE_ONE_COMPLETED}
            onCompletionMessage="✅ Public key has been transfered"
            defaultMessage="1️⃣ Transfer to 📱 public key to start DKG"
            onClickHandler={() => {
              setSocketPayload(pub);
              setCurrentStep("step_1_1");
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
            }}
          />
        )}
        {instance == 1 && STEP_ONE_TWO_COMPLETED && (
          <MPCButton
            hasBeenCompleted={!!keyshare}
            onCompletionMessage="✅ DKG message and completed setup"
            defaultMessage="5️⃣ Scan 📱's last QR code to complete DKG setup"
            onClickHandler={() => {
              setCurrentStep("step_1_3");
            }}
          />
        )}
        {pub && instance == 2 && socketPayload != '' && (
          <MPCButton
            hasBeenCompleted={STEP_TWO_ONE_COMPLETED}
            onCompletionMessage="✅ First signed message has been transfered"
            defaultMessage="2️⃣ Send back to 💻 first signed payload"
            onClickHandler={() => {
              setCurrentStep("step_2_1");
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
            }}
          />
        )}
      </Flex>
    </Flex>
  );
};
