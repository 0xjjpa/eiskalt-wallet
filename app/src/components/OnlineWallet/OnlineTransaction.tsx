import { Flex, Text, Code } from "@chakra-ui/react";

export const OnlineTransaction = () => {
  return (
    <Flex>
      <Text fontSize={"xs"}>
        Scan the QR code to sign a transaction to deposit <Code>1.00 XRP</Code>
      </Text>
    </Flex>
  );
};
