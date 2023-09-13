import { Flex, Heading, Code, Text, IconButton, Box } from "@chakra-ui/react";
const { getHash } = require("emoji-hash-gen");
import { abbreviate } from "../../helpers";
import { useEffect, useState } from "react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export const MPCValue = ({
  label,
  value,
  emoji,
  description,
  explanation,
}: {
  label: string;
  value: string;
  emoji?: string;
  description?: string;
  explanation?: string;
}) => {
  useEffect(() => {
    console.log("(#️⃣,ℹ️) Public Key Hash", getHash(value));
    console.log("(🔑,ℹ️) Value", value);
  }, [value]);
  const [displayHash, setDisplayHash] = useState(false);
  return (
    <Flex flexDir={"column"} gap="2">
      <Heading fontSize={"xl"} as="h3">
        {label} {emoji}
      </Heading>
      {explanation && <Text fontSize="xs">{explanation}</Text>}
      <Code px="2" py="1">
        {abbreviate(value)}
        <IconButton
          size={"xs"}
          w="fit-content"
          ml="5px"
          icon={!displayHash ? <ViewIcon /> : <ViewOffIcon />}
          onClick={() => setDisplayHash(!displayHash)}
          aria-label="Display hash"
        />
      </Code>
      {displayHash && (
        <Box>
          <Text letterSpacing={"10px"}>{getHash(value)}</Text>
          <Flex
            justifyContent={"center"}
            alignItems={"baseline"}
            fontFamily={"mono"}
            mt="2"
          >
            {description && <Text fontSize={"xs"}>{description}</Text>}
          </Flex>
        </Box>
      )}
    </Flex>
  );
};
