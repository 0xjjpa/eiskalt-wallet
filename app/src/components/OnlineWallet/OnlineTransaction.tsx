import { Flex, Text, Code } from "@chakra-ui/react";
import { QRCodeImage } from "../QRCodeImage";
import { useEffect, useState } from "react";
import { Client, Wallet } from "xrpl";
import { buildTransaction } from "../../lib/xrpl";

export const OnlineTransaction = ({ addressToWithdraw, xrplClient, wallet }: { addressToWithdraw: string, xrplClient: Client, wallet: Wallet }) => {
  const [preparedTransactionAsJSONPayload, setpreparedTransactionAsJSONPayload] = useState("hello");
  useEffect(() => {
    const prepareTransaction = async() => {
      const payment = buildTransaction(
        addressToWithdraw,
        wallet.address,
        `${10000000}`
        )
      const prepared = await xrplClient.autofill(payment)
      setpreparedTransactionAsJSONPayload(JSON.stringify(prepared));
    }
    addressToWithdraw && wallet && xrplClient && prepareTransaction();
  }, [addressToWithdraw, wallet, xrplClient])
  return (
    <Flex flexDir={'column'} gap='2'>
      <Text fontSize={"xs"}>
        Scan the QR code to sign a transaction to deposit <Code>0.01 XRP</Code>
      </Text>
      <QRCodeImage payload={preparedTransactionAsJSONPayload} />
    </Flex>
  );
};
