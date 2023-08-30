import { Button, Code, Flex, Heading, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DKGP1, DKGP2 } from "@safeheron/two-party-mpc-adapter";

import { abbreviate } from "../../helpers";
import { QRScanner } from "../QRScanner";
import { QRCodeImage } from "../QRCodeImage";

export const MPCWallet = ({
  dkg,
  setPriv,
  setPub,
  pub,
  instance,
}: {
  dkg: DKGP1 | DKGP2;
  setPriv: (priv: string) => void;
  setPub: (pub: string) => void;
  pub: string;
  instance: number;
}) => {
  const toast = useToast();

  const [isLoading, setLoading] = useState(false);
  const [failTimeout, setFailTimeout] = useState<NodeJS.Timeout>();
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");

  const handleDKGP1 = async () => {
    console.log("(🔑,⚙️) 🟠 Kickstarting DKG process");
    const { priv, pub } = await dkg.createContext();
    setPriv(priv);
    setPub(pub);
    console.log("(🔑,⚙️) 🟢 DKG process finished");
    setLoading(false);
  };

  const scanMessageOne = async ({ pub }) => {
    const dkgp1 = dkg as DKGP1;
    const message1 = await dkgp1.step1(pub);
  };
  useEffect(() => {
    clearTimeout(failTimeout);
    setFailTimeout(null);
  }, [isLoading]);

  return (
    <Flex mt="2" textAlign={"center"} gap="10" flexDir={"column"}>
      <Button
        isLoading={isLoading}
        onClick={() => {
          console.log("(🔑,⬇️) Starting onClick handler");
          setLoading(true);
          setTimeout(() => {
            handleDKGP1();
          }, 0);
          const fail = setTimeout(() => {
            toast({
              title: "DKG Algorithm",
              description: "Key Generation timed out",
              status: "error",
            });
          }, 60000);
          setFailTimeout(fail);
        }}
      >
        {`🔑 Generate MPC share (pt.${instance})`}
      </Button>
      {pub && (
        <Flex flexDir={"column"} gap="2">
          <Heading fontSize={"xl"} as="h3">
            Pub Address
          </Heading>
          <Code px="2" py="1">
            {abbreviate(pub)}
          </Code>
          <QRCodeImage payload={pub} />
          <Heading fontSize={"xl"} as="h3">
            Scanner
          </Heading>
          <Button onClick={() => setEnableQRScanner(!enableQRScanner)}>
            📸 Scan pubKey to start DKG handshake
          </Button>
          {enableQRScanner && <QRScanner setBarcodeValue={setBarcodeValue} />}
        </Flex>
      )}
    </Flex>
  );
};
