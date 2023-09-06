import { Text, Code, Flex, Badge, useToast, Button } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useState, useEffect } from "react";
import { DKGP2 } from "@safeheron/two-party-mpc-adapter";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { OfflineWallet } from "../components/OfflineWallet/OfflineWallet";
import { MPCWallet } from "../components/MPCWallet/MPCWallet";
import { ContentIntro } from "../components/Content/ContentIntro";
import { ContentFooter } from "../components/Content/ContentFooter";

const dkgp2PrivAtom = atomWithStorage("dkgp2-priv", "");
const dkgp2PubAtom = atomWithStorage("dkgp2-pub", "");

const Index = () => {
  const toast = useToast();
  const [dkg, setDKG] = useState<DKGP2>();
  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();

  const [priv, setPriv] = useAtom(dkgp2PrivAtom);
  const [pub, setPub] = useAtom(dkgp2PubAtom);
  const INSTANCE = 2;

  useEffect(() => {
    const dkg2 = new DKGP2();
    setDKG(dkg2);
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
          <Text fontSize="2xl">Mobile</Text>
          <Text fontSize="sm" textAlign={"center"}>
            For the computer to kickstart the <b>Distributed Key Generation (or DKG)</b>, we'll
            also create our own share of private keys and share our public key. Once that process
            has been completed, we'll scan the first signed message by the computer’s keyshare.
          </Text>
          <Flex mt="4" flexDir={"column"} maxW={'320px'}>
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
              {`🔑 Start DKG (from 📱)`}
            </Button>
            <MPCWallet dkg={dkg} pub={pub} priv={priv} instance={2} />
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
