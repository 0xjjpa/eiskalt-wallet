import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
} from "@chakra-ui/react";
import { CheckCircleIcon, LinkIcon } from "@chakra-ui/icons";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";

const Index = () => (
  <Container height="100vh">
    <Hero />
    <Main>
      <Text color="text" textAlign={"center"} fontSize={"xl"}>
        A small demo showcasing how MPC wallets generate keys and create
        signatures.
      </Text>
      <Text mt='3'>
        You have probably heard about <Code>MPC</Code> wallets, and why they are
        extremely relevant and important in the digital asset industry. Although
        there are many concepts around them, the core of an <Code>MPC</Code> wallet is simple:
        <b> it enables the generation of private keys and signing with them
          without having to rely on a single point of failure.
        </b>
      </Text>
      <Text>
        The following is a demo showcases a popular MPC algorithm, using
        the <Code>2-out-2</Code> ECDSA setup for a signature key. We'll use
        your computer and your mobile phone to control an Ethereum wallet
        and submit a transaction with it.
      </Text>
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

export default Index;
