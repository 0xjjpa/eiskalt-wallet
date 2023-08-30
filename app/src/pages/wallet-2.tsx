import { Text, Code, Flex, Badge } from "@chakra-ui/react";
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


const dkgp2PrivAtom = atomWithStorage('dkgp2-priv', "")
const dkgp2PubAtom = atomWithStorage('dkgp2-pub', "")

const Index = () => {
  const isOnline = useOnlineStatus();
  const [dkg, setDKG] = useState<DKGP2>();
  const [priv, setPriv] = useAtom(dkgp2PrivAtom);
  const [pub, setPub] = useAtom(dkgp2PubAtom);

  useEffect(() => {
    const dkg2 = new DKGP2();
    setDKG(dkg2);
  }, []);

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
          <Flex mt="4">
            <MPCWallet dkg={dkg} setPriv={setPriv} setPub={setPub} pub={pub} instance={2} />
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
