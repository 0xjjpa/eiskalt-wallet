import {
  Code,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
const { getHash } = require("emoji-hash-gen");
import { QRScanner } from "../QRScanner";
import { readFromIPFSURL } from "../../lib/ipfs";

export const MPCScanner = ({
  isOpen,
  onClose,
  setScannerValue,
  scannedValue,
}: {
  isOpen: boolean;
  onClose: () => void;
  setScannerValue: (value: string) => void;
  scannedValue: string;
}) => {
  const { onOpen, onClose: closeModal } = useDisclosure();
  const [enableBarcodeScanner, setEnableBarcodeScanner] = useState(true);
  const [actualValue, setActualValue] = useState("");

  useEffect(() => {
    isOpen && onOpen();
  }, [isOpen]);

  const handleCloseModal = () => {
    closeModal();
    onClose();
  };

  useEffect(() => {
    console.log("Scanned value", scannedValue);
    setEnableBarcodeScanner(false);
    const loadActualValue = async(scannedValue) => {
      const response = await readFromIPFSURL(scannedValue);
      const qrPayload = response.message;
      setActualValue(qrPayload);
    }
    scannedValue && loadActualValue(scannedValue);
    return () => {
      setActualValue("");
    }
  }, [scannedValue]);

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal}>
      <ModalOverlay />
      <ModalContent mx="5">
        <ModalHeader>Scan QR code 🔲</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {enableBarcodeScanner ? (
            <QRScanner setBarcodeValue={setScannerValue} />
          ) : (
            <Flex flexDir={"column"}>
              <Code p="3" textAlign={'center'}>
                {scannedValue
                  ? `You have scanned a value with the following emoji hash. Verify in the other device it maches or scan again if it doesn’t match: ${getHash(
                    actualValue
                    )}`
                  : `Open Camera to start scanning. Depending on your device you might need to open and close multiple times.`}
              </Code>
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={() => setEnableBarcodeScanner(!enableBarcodeScanner)}
          >
            {enableBarcodeScanner ? "Close Camera 📷" : "Open Camera 📸"}
          </Button>
          <Button variant="ghost" onClick={handleCloseModal}>
            Close scanner 🚫
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
