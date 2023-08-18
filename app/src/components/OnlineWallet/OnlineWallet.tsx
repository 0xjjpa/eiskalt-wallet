import { Box, Button, Code, Flex, Heading, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Client, Wallet } from "xrpl";
import { OnlineTransfer } from "./OnlineTransfer";
import { OnlineTransaction } from "./OnlineTransaction";

export const OnlineWallet = () => {
  const [wallet, setWallet] = useState<Wallet>();
  const [client, setClient] = useState<Client>();
  const [addressToTransfer, setAddressToTransfer] = useState("");
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
    const connectToNetwork = async () => {
      const client = new Client("wss://s.altnet.rippletest.net:51233");
      await client.connect();
      setClient(client);
    };
    connectToNetwork();
  }, []);

  const handleChangeAddress = (e) => setAddressToTransfer(e.target.value);

  return (
    <Flex mt="2" textAlign={"center"} gap="10" flexDir={"column"}>
      <Flex flexDir={"column"} gap="2">
        <Heading fontSize={"xl"} as="h3">
          Address
        </Heading>
        <Code px="2" py="1">
          {wallet?.classicAddress}
        </Code>
        <OnlineTransfer
          xrplClient={client}
          wallet={wallet}
          addressToTransfer={addressToTransfer}
          setAddressToTransfer={setAddressToTransfer}
        />
      </Flex>
      <Flex flexDir={"column"} gap="2">
        <Heading fontSize={"xl"} as="h3">
          Transaction
        </Heading>
        <InputGroup size="md">
        <Input
          type="text"
          value={addressToTransfer}
          onChange={handleChangeAddress}
          placeholder="rJrbSWfK...ZsySgZhZev"
        />
      </InputGroup>
        <OnlineTransaction addressToWithdraw={addressToTransfer} xrplClient={client} wallet={wallet} />
      </Flex>
    </Flex>
  );
};
