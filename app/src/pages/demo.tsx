import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
  Flex,
} from "@chakra-ui/react";
import { CheckCircleIcon, LinkIcon } from "@chakra-ui/icons";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import { OnlineWallet } from "../components/OnlineWallet/OnlineWallet";

const Index = () => (
  <Container height="100vh">
    <Hero />
    <Main>
      <Text color="text" textAlign={"center"} fontSize={"xl"}>
        Proof-of-concept for building an offline-only wallet using web
        technologies.
      </Text>

      <Flex alignItems={"center"} flexDir={"column"}>
        <Text fontSize="2xl">Demo mode</Text>
        <Text fontSize="sm">
          Wallet mode displays a transaction in the form of a QR code to be
          scanned.
        </Text>
        <Flex mt="4">
          <Flex flexDir={"column"}>
            <OnlineWallet />
          </Flex>
        </Flex>
      </Flex>
    </Main>

    <DarkModeSwitch />
    <Footer>
      <Text fontSize={"sm"}>
        A submission for Ripple CBDC Innovate by <Code>0xjjpa</Code>
      </Text>
    </Footer>
    <CTA />
  </Container>
);

export default Index;
