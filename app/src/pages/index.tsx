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
import { ContentIntro } from "../components/Content/ContentIntro";
import { ContentFooter } from "../components/Content/ContentFooter";
import { QRCodeImage } from "../components/QRCodeImage";
import { useEffect, useState } from "react";

const Index = () => { 
  const [currentUrl, setCurrentUrl] = useState("No URL yet");

  useEffect(() => {
    location && setCurrentUrl(`${location.href}/mobile`)
  }, [])
  
  return(
  <Container height="100vh">
    <Hero />
    <Main>
      <ContentIntro />
      <Text mt="3">
        You have probably heard about <Code>MPC</Code> wallets, and why they are
        extremely relevant and important in the digital asset industry. Although
        there are many concepts around them, the core of an <Code>MPC</Code>{" "}
        wallet is simple:
        <b>
          {" "}
          it enables the management of digital asset addresses the ability to
          sign transactions without having to rely on a single point of failure.
        </b>
      </Text>
      <Text>
        The following is a live demo which relies on a Paillier cryptosystem to
        generate a <Code>2-out-2</Code> threshold signature schema using a
        computer and a mobile phone to derive a crypto account and sign valid
        transactions for the account.
      </Text>
      <Flex flexDir={"column"} textAlign={'center'}>
        <QRCodeImage payload={currentUrl} />
        <Text fontSize={"xs"}>
          Scan this with your mobile phone to go to the mobile section, then head out to the "💻 Computer" section.
        </Text>
      </Flex>
    </Main>

    <DarkModeSwitch />
    <ContentFooter />
    <CTA />
  </Container>
)};

export default Index;
