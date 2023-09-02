import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Container } from './Container'

export const CTA = () => {
  const pathname = usePathname()
  return (
  <Container
    flexDirection="row"
    position="fixed"
    bottom={0}
    width="full"
    maxWidth="3xl"
    py={3}
  >
    <Button
      as={Link}
      href='/computer'
      colorScheme={ pathname == '/computer' ? "green" : "blue" }
      variant="solid"
      rounded="button"
      flexGrow={1}
      mx={2}
      width="full"
    >
      💻 Computer
    </Button>
    <Button
      as={Link}
      href='/mobile'
      colorScheme={ pathname == '/mobile' ? "green" : "blue" }
      variant="solid"
      rounded="button"
      flexGrow={3}
      mx={2}
      width="full"
    >
      📱 Mobile
    </Button>
  </Container>
)}
