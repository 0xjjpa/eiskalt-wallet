import { Text, Code, Flex, Badge } from "@chakra-ui/react";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { Footer } from "../components/Footer";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { OfflineWallet } from "../components/OfflineWallet/OfflineWallet";

const Index = () => {
  const isOnline = useOnlineStatus();

  return (
    <Container height="100vh">
      <Hero />
      <Main>
        <Text color="text" textAlign={"center"} fontSize={"xl"}>
          Proof-of-concept for building an offline-only wallet using web
          technologies.
        </Text>

        <Flex alignItems={"center"} flexDir={"column"}>
          <Text fontSize="2xl">Wallet mode</Text>
          <Text fontSize="sm">
            Wallet mode is only available if the device is offline and the
            application has been saved as a PWA.
          </Text>
          <Flex mt="4">
            {isOnline ? (
              <Flex flexDir={"column"}>
                <Badge colorScheme="green">Device is offline</Badge>
                <OfflineWallet />
              </Flex>
            ) : (
              <Badge colorScheme="red">Device is online</Badge>
            )}
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
};

export default Index;
