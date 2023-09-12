import { Text, Flex, useToast, Button } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { DKGP2 } from "@safeheron/two-party-mpc-adapter";

import { Hero } from "../components/Hero";
import { Container } from "../components/Container";
import { Main } from "../components/Main";
import { DarkModeSwitch } from "../components/DarkModeSwitch";
import { CTA } from "../components/CTA";
import { MPCWallet } from "../components/MPCWallet/MPCWallet";
import { ContentIntro } from "../components/Content/ContentIntro";
import { ContentFooter } from "../components/Content/ContentFooter";
import { useRouter } from "next/router";

const Index = () => {
  const { query, isReady } = useRouter();
  const toast = useToast();
  const [dkg, setDKG] = useState<DKGP2>();
  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();

  const [priv, setPriv] = useState("");
  const [pub, setPub] = useState("");
  const INSTANCE = 2;

  useEffect(() => {
    const redirectDesktop = async(uuid: string) => {
      console.log('(📱,ℹ️) Triggering redirection...');
      const response = await (await fetch('/api/redirect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: uuid }),
      })).json();
      console.log('(📱,ℹ️) Redirection triggered', response);
    }
    const uuid = query?.uuid;
    if (uuid) {
      console.log('(🆔,ℹ️) UUID Found, triggering API call', uuid);
      redirectDesktop(`${uuid}`);
    }
  }, [isReady])

  useEffect(() => {
    const dkg2 = new DKGP2();
    setDKG(dkg2);
    return () => {
      setDKG(null);
    };
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
            For the computer to kickstart the{" "}
            <b>Distributed Key Generation (or DKG)</b>, we'll also create our
            own share of private keys and share our public key. Once that
            process has been completed, we'll scan the first signed message by
            the computer’s keyshare.
          </Text>
          <Flex mt="4" flexDir={"column"} maxW={"320px"}>
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
            <MPCWallet dkg={dkg} pub={pub} priv={priv} instance={INSTANCE} />
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
