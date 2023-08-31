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

const dkgp2PrivAtom = atomWithStorage("dkgp2-priv", "");
const dkgp2PubAtom = atomWithStorage("dkgp2-pub", "");

const Index = () => {
  const toast = useToast();
  const [dkg, setDKG] = useState<DKGP2>();
  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();

  const [priv, setPriv] = useAtom(dkgp2PrivAtom);
  const [pub, setPub] = useAtom(dkgp2PubAtom);
  const INSTANCE = 2

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
        <Text color="text" textAlign={"center"} fontSize={"xl"}>
          Proof-of-concept for building a smart wallet using a 2-out-2 mpc
          threshold schema.
        </Text>

        <Flex alignItems={"center"} flexDir={"column"}>
          <Text fontSize="2xl">Wallet 2</Text>
          <Text fontSize="sm">
            Wallet mode is only available if the device is offline and the
            application has been saved as a PWA.
          </Text>
          <Flex mt="4" flexDir={"column"}>
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
              {`🔑 Generate MPC share (pt.${INSTANCE})`}
            </Button>
            <MPCWallet
              dkg={dkg}
              setPriv={setPriv}
              setPub={setPub}
              pub={pub}
              instance={2}
            />
          </Flex>
        </Flex>
      </Main>

      <DarkModeSwitch />
      <Footer>
        <Text fontSize={"sm"}>
          A proof of concept by <Code>0xjjpa</Code>
        </Text>
      </Footer>
      <CTA />
    </Container>
  );
};

export default Index;
