import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";

export const CTA = () => {
  const { query } = useRouter();
  const isMobile = query?.mobile;
  return !isMobile ? (
    <Button colorScheme="dark" disabled position="fixed" top={4} left={4} aria-label="Computer Device">
      🖥️
    </Button>
  ) : (
    <Button colorScheme="dark" disabled position="fixed" top={4} left={4} aria-label="Mobile Device">
      📱
    </Button>
  );
};
