import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
  Flex,
} from "@chakra-ui/react";
import { DKGP1 } from "@safeheron/two-party-mpc-adapter";
import { useState, useEffect } from 'react';

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import { MPCWallet } from "../components/MPCWallet/MPCWallet";


const dkgp1PrivAtom = atomWithStorage('dkgp1-priv', "")
const dkgp1PubAtom = atomWithStorage('dkgp1-pub', "")

const Index = () => {
  const [dkg, setDKG] = useState<DKGP1>();
  const [priv, setPriv] = useAtom(dkgp1PrivAtom);
  const [pub, setPub] = useAtom(dkgp1PubAtom);

  useEffect(() => {
    const dkg1 = new DKGP1();
    setDKG(dkg1);
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
        <Text fontSize="2xl">Wallet 1</Text>
        <Text fontSize="sm">
          Wallet mode displays a transaction in the form of a QR code to be
          scanned.
        </Text>
        <Flex mt="4">
          <Flex flexDir={"column"}>
            <MPCWallet dkg={dkg} setPriv={setPriv} setPub={setPub} pub={pub} instance={1} />
          </Flex>
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
)};

export default Index;
