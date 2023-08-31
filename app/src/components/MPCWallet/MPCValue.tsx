import { Flex, Heading, Code, Text } from "@chakra-ui/react";
const { getHash } = require("emoji-hash-gen");
import { abbreviate } from "../../helpers";

export const MPCValue = ({ label, value }: { label: string, value: string }) => {
  return (
    <Flex flexDir={"column"} gap="2">
      <Heading fontSize={"xl"} as="h3">
        {label}
      </Heading>
      <Code px="2" py="1">
        {abbreviate(value)}
      </Code>
      <Text letterSpacing={"10px"}>{getHash(value)}</Text>
      <Text fontSize={'xs'}>{value.length} characters.</Text>
    </Flex>
  );
};
