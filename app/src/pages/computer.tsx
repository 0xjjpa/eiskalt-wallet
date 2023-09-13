import { Text, Flex, Button, useToast } from "@chakra-ui/react";
import { DKGP1 } from "@safeheron/two-party-mpc-adapter";
import { useState, useEffect } from "react";
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
import Pusher from "pusher-js";

const Index = () => {
  const toast = useToast();
  const { query, isReady } = useRouter();
  const [dkg, setDKG] = useState<DKGP1>();
  const [socketPayload, setSocketPayload] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();
  const [uuid, setUUID] = useState("");

  const [priv, setPriv] = useState("");
  const [pub, setPub] = useState("");
  const INSTANCE = 1;

  useEffect(() => {
    const dkg1 = new DKGP1();
    setDKG(dkg1);
    return () => {
      setDKG(null);
    };
  }, []);

  useEffect(() => {
    const uuid = query?.uuid;
    const mobilePub = query?.pub;
    console.log("(🌎,ℹ️) Query parameters", query);

    if (mobilePub) {
      console.log("(💻,ℹ️) Mobile Pub found", mobilePub);
      setSocketPayload(`${mobilePub}`);
    }

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

      channel.bind("step", function (data) {
        console.log("(💻|📱,ℹ️) Step detected (from 💻), data)");
        console.log("(#️⃣,ℹ️) Hash for payload", getHash(data.payload));
        data.instance != INSTANCE && setSocketPayload(data.payload);
      });

      return () => {
        pusher.unsubscribe(channelId);
      };
    }
  }, [isReady]);

  const handleDKGP1 = async () => {
    console.log("(🔑,⚙️) 🟠 Kickstarting DKG process");
    const { priv, pub } = await dkg.createContext();
    setPriv(priv);
    setPub(pub);
    console.log("(🔑,⚙️) 🟢 DKG process finished");
    setLoading(false);
  };

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
          <Text fontSize="2xl">Computer</Text>
          <Text fontSize="sm">
            We'll start the <b>Distributed Key Generation (DKG)</b> on our main
            device and use it to share the key. This might take time and
            possibly freeze your browser, depending on your computer.
          </Text>
          <Flex mt="4">
            <Flex flexDir={"column"}>
              <Button
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
                {`🔑 Start DKG (from 💻)`}
              </Button>
              <MPCWallet
                socketPayload={socketPayload}
                setSocketPayload={setSocketPayload}
                id={uuid}
                dkg={dkg}
                pub={pub}
                priv={priv}
                instance={INSTANCE}
              />
            </Flex>
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
