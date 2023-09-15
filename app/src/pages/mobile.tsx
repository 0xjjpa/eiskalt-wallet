import { Text, Flex, useToast, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { DKGP2 } from "@safeheron/two-party-mpc-adapter";
import Pusher from "pusher-js";
const { getHash } = require("emoji-hash-gen");

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { MPCWallet } from "../components/MPCWallet/MPCWallet";
import { ContentIntro } from "../components/Content/ContentIntro";
import { ContentFooter } from "../components/Content/ContentFooter";
import { useRouter } from "next/router";
import { mpcSDK } from "../lib/mpc";
import { WebsocketPayload, cosignerHandler } from "../lib/pusher";
import { Supabase } from "../lib/supabase";

const Index = () => {
  const { query, isReady } = useRouter();
  const toast = useToast();
  const [dkg, setDKG] = useState<DKGP2>();
  const [socketPayload, setSocketPayload] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();
  const [uuid, setUUID] = useState("");
  const [channel, setChannel] = useState<Supabase>();

  const [priv, setPriv] = useState("");
  const [pub, setPub] = useState("");
  const INSTANCE = 2;

  const handleDKGP1 = async () => {
    console.log("(🔑,⚙️) 🟠 Kickstarting DKG process");
    const { priv, pub } = await dkg.createContext();
    setPriv(priv);
    setPub(pub);
    console.log("(🔑,⚙️) 🟢 DKG process finished");
    setLoading(false);
    return pub;
  };

  useEffect(() => {
    const triggerAPICallToredirectDesktop = async (
      uuid: string,
      mobilePub: string
    ) => {
      console.log("(📱,ℹ️) Triggering redirection...");
      const response = await (
        await fetch("/api/redirect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: uuid, pub: mobilePub }),
        })
      ).json();
      console.log("(📱,ℹ️) Redirection triggered", response);
    };
    const preRequiredOperations = async (uuid: string) => {
      const mobilePub = await handleDKGP1();
      triggerAPICallToredirectDesktop(uuid, mobilePub);
    };

    const uuid = query?.uuid;
    if (uuid) {
      console.log("(🆔,ℹ️) UUID Found, triggering API call", uuid);
      preRequiredOperations(`${uuid}`);
    }
  }, [isReady]);

  useEffect(() => {
    const dkg2 = new DKGP2();
    setDKG(dkg2);
    return () => {
      setDKG(null);
    };
  }, []);

  useEffect(() => {
    const uuid = query?.uuid;
    if (uuid) {
      console.log(
        "(🆔,ℹ️) UUID Found, openning channel to listen to browser calls",
        uuid
      );

      Pusher.logToConsole = true;
      const channelId = `${uuid}`;

      const pusher = new Pusher("d444fe7b34402daa6334", {
        cluster: "eu",
      });
      const channel = pusher.subscribe(channelId);
      setUUID(channelId);

      channel.bind("step", function (data: WebsocketPayload) {
        console.log("(💻|📱,ℹ️) Step detected (from 📱)", data);
        console.log("(#️⃣,ℹ️) Hash for payload", getHash(data.payload));
        data.instance != INSTANCE && setSocketPayload(data.payload);
      });

      channel.bind("sign", cosignerHandler({ instance: INSTANCE }));

      const mobilePub = query?.pub;
      if (mobilePub) {
        mpcSDK({
          id: channelId,
          instance: INSTANCE,
          payload: `${mobilePub}`,
          step: "step_0",
        });
      }

      return () => {
        pusher.unsubscribe(channelId);
      };
    }
  }, [isReady]);

  useEffect(() => {
    const uuid = query?.uuid;
    if (uuid) {
      const channel = new Supabase(`${uuid}`);
      channel.listen("sign", cosignerHandler({ instance: INSTANCE }))
      setChannel(channel);
    }
  }, [isReady])

  useEffect(() => {
    clearTimeout(failTimeout);
    setFailTimeout(null);
  }, [isLoading]);

  return (
    <Container height="100vh">
      <Hero />
      <Main>
        <ContentIntro />

        <Flex alignItems={"center"} flexDir={"column"}>
          <Text fontSize="2xl">Mobile</Text>
          <Text fontSize="sm" textAlign={"center"}>
            The computer will start the Distributed Key Generation (DKG). We have
            created our private keys and shared them our public key. We now need to
            wait for their public key to proceed with the next step.
          </Text>
          <Flex mt="4" flexDir={"column"} maxW={"340px"}>
            {/* <Button
              isLoading={isLoading}
              onClick={() => {
                console.log("(🔑,⬇️) Starting onClick handler");
                setLoading(true);
                setTimeout(() => {
                  handleDKGP1();
                }, 0);
                const fail = setTimeout(() => {
                  toast({
                    title: "DKG Algorithm",
                    description: "Key Generation timed out",
                    status: "error",
                  });
                }, 60000);
                setFailTimeout(fail);
              }}
            >
              {`🔑 Start DKG (from 📱)`}
            </Button> */}
            <MPCWallet
              setSocketPayload={setSocketPayload}
              socketPayload={socketPayload}
              id={uuid}
              dkg={dkg}
              pub={pub}
              priv={priv}
              instance={INSTANCE}
              channel={channel}
            />
          </Flex>
        </Flex>
      </Main>

      <DarkModeSwitch />
      <ContentFooter />
      <CTA />
    </Container>
  );
};

export default Index;
