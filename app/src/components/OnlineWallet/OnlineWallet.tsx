import {
  Box,
  Button,
  Code,
  Flex,
  Heading,
  Input,
  InputGroup,
  Link as ChakraLink,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Client, Wallet } from "xrpl";
import { OnlineTransfer } from "./OnlineTransfer";
import { OnlineTransaction } from "./OnlineTransaction";
import { QRScanner } from "../QRScanner";
import { isTransactionMetadata } from "../../lib/xrpl";

export const OnlineWallet = () => {
  const toast = useToast();
  const [wallet, setWallet] = useState<Wallet>();
  const [client, setClient] = useState<Client>();
  const [addressToTransfer, setAddressToTransfer] = useState("");
  const [isSuccessful, setSuccessful] = useState(false);
  const [transferTx, setTransferTx] = useState("");
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");

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
    const broadcastTransaction = async () => {
      if (qrPayload) {
        console.log("QR Data found (to broadcast).", qrPayload);
        const tx = await client.submitAndWait(qrPayload);
        console.log(`👤 User Module Found - Completed`, tx);
        if (
          isTransactionMetadata(tx.result.meta) &&
          typeof tx.result.meta != "string"
        ) {
          tx.result.meta.TransactionResult == "XRPL_SUCCESSFUL_TES_CODE";
          setSuccessful(true);
          toast({
            title: "Transaction successful.",
            description: `Transaction hash: ${tx.result.hash}`,
            status: "success",
            duration: 9000,
            isClosable: true,
          });
        }
        setEnableQRScanner(false);
        setTransferTx(tx.result.hash);
      }
    };
    broadcastTransaction();
  }, [qrPayload]);

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
    <Flex mt="10" textAlign={"center"} gap="10" flexDir={"column"}>
      <Flex flexDir={"column"} gap="2">
        <Heading fontSize={"xl"} as="h3">
          Pub Address
        </Heading>
        <Code px="2" py="1">
          {wallet?.classicAddress}
        </Code>
      </Flex>
      <Flex flexDir={"column"} gap="2">
        <Heading fontSize={"xl"} as="h3">
          Scanner
        </Heading>
        <Button onClick={() => setEnableQRScanner(!enableQRScanner)}>
          🖊️ Scan to broadcast transaction
        </Button>
        {enableQRScanner && <QRScanner setBarcodeValue={setBarcodeValue} />}
        {transferTx.length > 0 && (
          <Text mt="2">
            Transfer {isSuccessful ? "successful" : "failed"} -{" "}
            <ChakraLink
              isExternal
              href={`
            https://testnet.xrpl.org/transactions/${transferTx}`}
            >
              See Transfer
            </ChakraLink>
          </Text>
        )}
      </Flex>
    </Flex>
  );
};
