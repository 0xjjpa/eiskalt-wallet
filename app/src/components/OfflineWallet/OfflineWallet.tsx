import { Wallet, ECDSA, Transaction } from "xrpl";
import { Box, Button, Heading, Text, Code, Flex } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { QRScanner } from "../QRScanner";
import { QRCodeImage } from "../QRCodeImage";

type WalletsData = {
  id: string;
  publicKey: string;
  privateKey: string;
};

export const OfflineWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [enableQRScanner, setEnableQRScanner] = useState(false);
  const [qrPayload, setBarcodeValue] = useState("");
  const [signedTransaction, setSignedTransaction] = useState(null);

  useEffect(() => {
    const signTransaction = async () => {
      if (qrPayload) {
        console.log("QR Data found.", qrPayload);
        const preparedTransaction = JSON.parse(qrPayload) as Transaction;
        const signedTransaction = wallet.sign(preparedTransaction)
        console.log("Signed Transaction", signedTransaction);
        setSignedTransaction(signedTransaction)
        setEnableQRScanner(false);
      }
    };
    signTransaction();
  }, [qrPayload]);

  useEffect(() => {
    const checkAndLoadWallet = async () => {
      const wallet = await getWalletFromIndexDB();
      if (!wallet) {
        const newWallet = await generateAndStoreWallet();
        setWallet(newWallet);
      } else {
        setWallet(wallet);
      }
    };
    checkAndLoadWallet();
  }, []);

  useEffect(() => {
    console.log("💳 Wallet loaded in memory", wallet);
  }, [wallet]);

  const getWalletFromIndexDB = async (): Promise<Wallet | null> => {
    return new Promise(async (resolve) => {
      const openRequest = indexedDB.open("walletDatabase", 1);

      openRequest.onupgradeneeded = () => {
        const db = openRequest.result;
        if (!db.objectStoreNames.contains("wallets")) {
          db.createObjectStore("wallets", { keyPath: "id" });
        }
      };

      openRequest.onsuccess = async () => {
        const db = openRequest.result;
        const transaction = db.transaction("wallets", "readonly");
        const walletsStore = transaction.objectStore("wallets");
        const request = walletsStore.get("ECDSA_SECP256K1");

        request.onsuccess = async () => {
          const walletDataFromDB = request.result as WalletsData;
          if (walletDataFromDB) {
            const wallet = new Wallet(
              walletDataFromDB.publicKey,
              walletDataFromDB.privateKey
            );
            resolve(wallet);
          } else {
            resolve(null);
          }
        };
      };

      openRequest.onerror = () => {
        console.error("Error opening indexedDB:", openRequest.error);
        resolve(null);
      };
    });
  };

  const generateAndStoreWallet = async (): Promise<Wallet> => {
    const wallet = Wallet.generate(ECDSA.secp256k1);
    console.log("Wallet", wallet);

    const publicKey = wallet.publicKey;
    const privateKey = wallet.privateKey;

    const dbData = {
      id: "ECDSA_SECP256K1",
      publicKey,
      privateKey,
    };

    const openRequest = indexedDB.open("walletDatabase", 1);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction("wallets", "readwrite");
      const walletsStore = transaction.objectStore("wallets");
      const request = walletsStore.put(dbData);

      request.onerror = () => {
        console.error("Error storing wallet data in indexedDB:", request.error);
      };
    };

    openRequest.onerror = () => {
      console.error("Error opening indexedDB:", openRequest.error);
    };

    return wallet as Wallet;
  };

  return (
    <Flex mt="2" textAlign={"center"} gap="10" flexDir={"column"}>
      <Flex flexDir={"column"} gap="2">
        <Heading fontSize={"xl"} as="h3">
          Address
        </Heading>
        <Code px="2" py="1">
          {wallet?.classicAddress}
        </Code>
      </Flex>
      <Flex flexDir={"column"} gap="2">
        <Heading fontSize={"xl"} as="h3">
          Signing
        </Heading>
        <Button onClick={() => setEnableQRScanner(!enableQRScanner)}>🖊️ Scan to sign transaction</Button>
        {
          enableQRScanner && (<QRScanner setBarcodeValue={setBarcodeValue} />)
        }
        {
          signedTransaction && (<QRCodeImage payload={signedTransaction.tx_blob} />)
        }
      </Flex>
    </Flex>
  );
};
