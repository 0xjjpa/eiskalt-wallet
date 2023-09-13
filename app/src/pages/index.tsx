import {
  Text,
  Code,
  Flex,
  useColorMode,
  useClipboard,
  Box,
} from "@chakra-ui/react";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import Image from "next/image";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { ContentIntro } from "../components/Content/ContentIntro";
import { ContentFooter } from "../components/Content/ContentFooter";
import { QRCodeImage } from "../components/QRCodeImage";
import { randomBytes } from "crypto";
import { useRouter } from "next/router";

const Index = () => {
  const [currentUrl, setCurrentUrl] = useState("No URL yet");
  const { onCopy, setValue, hasCopied } = useClipboard("");

  const { colorMode } = useColorMode();
  const [ _, setUUID] = useState("");
  const { push } = useRouter();

  useEffect(() => {
    const uuid = randomBytes(16).toString("hex");
    console.log("(🆔,ℹ️) Generated Random UUID", uuid);
    setUUID(uuid);

    Pusher.logToConsole = true;
    const channelId = uuid;

    const pusher = new Pusher("d444fe7b34402daa6334", {
      cluster: "eu",
    });
    const channel = pusher.subscribe(channelId);

    channel.bind("mobile-redirect", function (data) {
      console.log("(📱,ℹ️) Mobile pairing device connected, ready to redirect", data);
      const id = data?.id;
      const mobilePub = data?.pub;
      if (uuid == id) {
        push(`/computer?uuid=${uuid}&pub=${mobilePub}`)
      }
    });

    location &&
      setCurrentUrl(`${location.href}/mobile?uuid=${uuid}&mobile=true`);
    return () => {
      pusher.unsubscribe(channelId);
    };
  }, []);

  useEffect(() => {
    setValue(currentUrl);
    return () => {
      setValue("");
    };
  }, [currentUrl]);

  return (
    <Container height="100vh">
      <Hero />
      <Main>
        <ContentIntro />
        <Text mt="3">
          In other words, MPC allows for computations on encrypted data without
          ever decrypting it. This means that multiple parties can
          collaboratively process data without ever revealing their individual
          inputs to each other.
        </Text>
        <Text>
          Within the context of the crypto ecosystem, MPC is being used for two
          particular reasons: Distributed Key Generation (DKG) and Threshold
          Signature Schemes (TSS).
        </Text>
        <Text>
          <b>Distributed Key Generation (or DKG)</b> is a protocol that enables
          multiple parties to collaboratively generate a public-private key
          pair. The catch here is that the private key is never assembled in its
          entirety at any single location or by any single party. Instead, each
          participant gets a share of the private key. Collectively, these
          shares represent the private key, but individually, they reveal
          nothing about the key itself. it enables the management of digital
          asset addresses the ability to sign transactions without having to
          rely on a single point of failure.
        </Text>
        {colorMode == "light" ? (
          <Image
            width={940}
            height={640}
            src="/images/dkg_black.png"
            alt="Threshold signature scheme"
          />
        ) : (
          <Image
            width={940}
            height={640}
            src="/images/dkg_white.png"
            alt="Threshold signature scheme"
          />
        )}
        <Text>
          <b>Threshold Signature Schemes (or TSS)</b> extend the concept of DKG.
          Once the key shares are distributed amongst participants using DKG,
          TSS allows a subset of these participants (at least a certain
          threshold number) to collaboratively sign a document or a transaction.
          The beauty of TSS is that even though the signatures are produced
          collectively, the resulting signature is indistinguishable from a
          signature produced by a traditional single-party scheme. Moreover,
          unless the threshold number of participants agree to sign, no valid
          signature can be produced.
        </Text>
        {colorMode == "light" ? (
          <Image
            width={940}
            height={640}
            src="/images/tss_black.png"
            alt="Threshold signature scheme"
          />
        ) : (
          <Image
            width={940}
            height={640}
            src="/images/tss_white.png"
            alt="Threshold signature scheme"
          />
        )}
        <Text>
          To showcase both processes, we have a live demo which relies on a
          Paillier cryptosystem to generate a <Code>2-out-2</Code> threshold
          signature schema using a computer and a mobile phone. We'll use the
          computer to kickstart the distributed generated key algorithm, and the
          phone to start the exchange of cryptographic data to eventually derive
          a crypto account and sign valid transactions for the account.
        </Text>
        <Flex flexDir={"column"} textAlign={"center"}>
          <Box mb="2" cursor={"pointer"} onClick={onCopy}>
            <QRCodeImage payload={currentUrl} />
          </Box>
          <Text fontSize={"xs"}>
            {hasCopied
              ? `Copied URL to your clipboard.`
              : `Scan this with your mobile phone to go to the mobile (📱) section.
            Upon scanning this, we'll redirect you to the computer (💻) section.
            Alternatively, click the QR code to copy the URL and open in a
            separate tab to mimic a separate device.`}
          </Text>
        </Flex>
      </Main>

      <DarkModeSwitch />
      <ContentFooter />
      {/* <CTA /> */}
    </Container>
  );
};

export default Index;
