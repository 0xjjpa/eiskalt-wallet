import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
  Flex,
  Button,
  useToast,
} from "@chakra-ui/react";
import { DKGP1 } from "@safeheron/two-party-mpc-adapter";
import { useState, useEffect } from "react";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import { MPCWallet } from "../components/MPCWallet/MPCWallet";
import { ContentIntro } from "../components/Content/ContentIntro";
import { ContentFooter } from "../components/Content/ContentFooter";

const dkgp1PrivAtom = atomWithStorage("dkgp1-priv", "");
const dkgp1PubAtom = atomWithStorage("dkgp1-pub", "");

const Index = () => {
  const toast = useToast();
  const [dkg, setDKG] = useState<DKGP1>();
  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();

  const [priv, setPriv] = useAtom(dkgp1PrivAtom);
  const [pub, setPub] = useAtom(dkgp1PubAtom);
  const INSTANCE = 1;

  useEffect(() => {
    const dkg1 = new DKGP1();
    setDKG(dkg1);
  }, []);

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
            We'll kickstart the <b>Distributed Key Generation</b> (or DKG for
            short) in our main device, which we'll then use to share the key
            with.
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
              <MPCWallet dkg={dkg} pub={pub} priv={priv} instance={INSTANCE} />
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
