import {
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Text,
  Link as ChakraLink,
  useToast,
  Code,
} from "@chakra-ui/react";
import { useState } from "react";
import { Client, Wallet } from "xrpl";
import { buildTransaction, isTransactionMetadata } from "../../lib/xrpl";

const DEFAULT_FUNDING_AMOUNT = 1000000000;

export const OnlineTransfer = ({
  xrplClient,
  wallet,
  addressToTransfer,
  setAddressToTransfer
}: {
  xrplClient: Client;
  wallet: Wallet;
  addressToTransfer: string,
  setAddressToTransfer: (address: string) => void
}) => {
  const toast = useToast();
  const [transferTx, setTransferTx] = useState("");
  const [isSuccessful, setSuccessful] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const handleChangeAddress = (e) => setAddressToTransfer(e.target.value);

  const transferXRP = async () => {
    setLoading(true);
    const prepared = await xrplClient.autofill(
      buildTransaction(
        wallet.address,
        `${addressToTransfer}`,
        `${DEFAULT_FUNDING_AMOUNT / 100}`
      )
    );

    const signed = wallet.sign(prepared);
    const tx = await xrplClient.submitAndWait(signed.tx_blob);
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

    setTransferTx(tx.result.hash);
    setLoading(false);
  };

  return (
    <>
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          type="text"
          value={addressToTransfer}
          onChange={handleChangeAddress}
          placeholder="rJrbSWfK...ZsySgZhZev"
        />
        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            disabled={!(addressToTransfer.length > 0)}
            isLoading={isLoading}
            size="sm"
            onClick={() => transferXRP()}
          >
            Enter
          </Button>
        </InputRightElement>
      </InputGroup>
      <Text fontSize={'xs'}>Provide an address to send a default <Code>10.00 XRP</Code></Text>
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
    </>
  );
};
