import { Flex, Heading, Code, Text } from "@chakra-ui/react";
const { getHash } = require("emoji-hash-gen");
import { abbreviate } from "../../helpers";

export const MPCValue = ({
  label,
  value,
  emoji,
  description,
  explanation
}: {
  label: string;
  value: string;
  emoji?: string;
  description?: string;
  explanation?: string;
}) => {
  return (
    <Flex flexDir={"column"} gap="2">
      <Heading fontSize={"xl"} as="h3">
        {label} {emoji}
      </Heading>
      {explanation && <Text fontSize='xs'>{explanation}</Text>}
      <Code px="2" py="1">
        {abbreviate(value)}
      </Code>
      <Text letterSpacing={"10px"}>{getHash(value)}</Text>
      <Flex justifyContent={'center'} alignItems={'baseline'} fontFamily={'mono'}>
        {description && <Text fontSize={'sm'}>{description}</Text>}
        <Text fontSize={"xs"}>({value.length} characters).</Text>
      </Flex>
    </Flex>
  );
};
