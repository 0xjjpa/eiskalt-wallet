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
        Proof-of-concept for building a smart wallet using a 2-out-2 mpc
        threshold schema.
      </Text>

      <List spacing={3} my={0} color="text" textAlign={"center"}>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Generate a <Code>secp256k1</Code> wallet securely using the Web
          Cryptography API.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Protect the private key by storing it in the browser using the Web
          IndexDB API.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Sign transactions offline only by ensuring the app has no internet
          using the Navigator API.
        </ListItem>
        <ListItem>
          <ListIcon as={CheckCircleIcon} color="green.500" />
          Exchange signed transactions by using QR codes for a reader and
          viewer.
        </ListItem>
      </List>
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
