import { Button } from '@chakra-ui/react'
import Link from 'next/link'
import { Container } from './Container'

export const CTA = () => (
  <Container
    flexDirection="row"
    position="fixed"
    bottom={0}
    width="full"
    maxWidth="3xl"
    py={3}
    bg='whiteAlpha.900'
    _dark={{
      bg: 'blackAlpha.300',
    }}
  >
    <Button
      as={Link}
      href='/wallet-1'
      variant="outline"
      colorScheme="blue"
      rounded="button"
      flexGrow={1}
      mx={2}
      width="full"
    >
      👤 Person 1
    </Button>
    <Button
      as={Link}
      href='/wallet-2'
      variant="solid"
      colorScheme="blue"
      rounded="button"
      flexGrow={3}
      mx={2}
      width="full"
    >
      👤 Person 2
    </Button>
  </Container>
)
