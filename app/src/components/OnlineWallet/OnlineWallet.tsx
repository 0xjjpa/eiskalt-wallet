import { Box, Code, Flex, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Client, Wallet } from "xrpl";
import { OnlineTransfer } from "./OnlineTransfer";

export const OnlineWallet = () => {
  const [wallet, setWallet] = useState<Wallet>();
  const [client, setClient] = useState<Client>();
  useEffect(() => {
    //@TODO: Remove this from front-end and to the backend.
    if (process.env.NEXT_PUBLIC_XRPL_DEMO_WALLET_SEED) {
      const wallet = Wallet.fromSeed(
        process.env.NEXT_PUBLIC_XRPL_DEMO_WALLET_SEED
      );
      setWallet(wallet);
    }
  }, []);

  useEffect(() => {
    const connectToNetwork = async() => {
      const client = new Client("wss://s.altnet.rippletest.net:51233")
      await client.connect()
      setClient(client);
    }
    connectToNetwork()
  }, [])
  return (
    <Flex mt="2" textAlign={"center"} gap='2' flexDir={'column'}>
      <Heading fontSize={"xl"} as="h3">
        Address
      </Heading>
      <Code px="2" py="1">
        {wallet?.classicAddress}
      </Code>
      <OnlineTransfer xrplClient={client} wallet={wallet} />
    </Flex>
  );
};
