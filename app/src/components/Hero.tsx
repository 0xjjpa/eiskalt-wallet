import { Flex, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Hero = ({ title }: { title: string }) => {
  const pathname = usePathname()
  return (
    <Flex
      justifyContent="center"
      alignItems="center"
      py="2rem"
      flexDir={"column"}
    >
      <Heading fontSize="6vw">{title}</Heading>
      { pathname != '/' && <Link href='/'><Text fontSize={'xs'} fontFamily={'mono'}>_back home</Text></Link> }
    </Flex>
  );
};

Hero.defaultProps = {
  title: "💻 mpc.is 📱",
};
