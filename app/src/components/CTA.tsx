import { Button } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "./Container";
import { useRouter } from "next/router";

export const CTA = () => {
  const pathname = usePathname();
  const { query } = useRouter();
  const isMobile = query?.mobile;
  return (
    <Container
      flexDirection="row"
      position="fixed"
      bottom={0}
      width="full"
      maxWidth="3xl"
      py={3}
    >
      {!isMobile ? (
        <Button
          as={Link}
          opacity={'0.5'}
          disabled
          href="/computer"
          colorScheme={pathname == "/computer" ? "green" : "blue"}
          variant="solid"
          rounded="button"
          flexGrow={1}
          mx={2}
          width="full"
        >
          💻 Computer
        </Button>
      ) : (
        <Button
          as={Link}
          href="/mobile"
          opacity={'0.5'}
          disabled
          colorScheme={pathname == "/mobile" ? "green" : "blue"}
          variant="solid"
          rounded="button"
          flexGrow={3}
          mx={2}
          width="full"
        >
          📱 Mobile
        </Button>
      )}
    </Container>
  );
};
