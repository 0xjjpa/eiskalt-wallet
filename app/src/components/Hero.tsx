import { Flex, Heading } from '@chakra-ui/react'

export const Hero = ({ title }: { title: string }) => (
  <Flex
    justifyContent="center"
    alignItems="center"
    py="2rem"
    bgGradient="linear(to-l, heroGradientStart, heroGradientEnd)"
    bgClip="text"
  >
    <Heading fontSize="6vw">{title}</Heading>
  </Flex>
)

Hero.defaultProps = {
  title: '👤 MPC Wallet 👥',
}
