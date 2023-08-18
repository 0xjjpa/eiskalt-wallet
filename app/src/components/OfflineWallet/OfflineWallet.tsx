import { Wallet, ECDSA } from 'xrpl'
import { Box, Button, Heading, Text, Code } from "@chakra-ui/react";
import { useEffect, useState } from "react";

type WalletsData = {
  id: string;
  publicKey: string;
  privateKey: string;
}

export const OfflineWallet = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    const checkAndLoadWallet = async () => {
      console.log('📦 Retrieving wallet from Index DB...')
      const wallet = await getWalletFromIndexDB();
      if (!wallet) {
        console.log("💳 Wallet not found in Index DB");
        const newWallet = await generateAndStoreWallet();
        setWallet(newWallet);
      } else {
        setWallet(wallet);
      }
    };
    checkAndLoadWallet();
  }, []);

  useEffect(() => {
    console.log('💳 Wallet loaded in memory', wallet);
  }, [wallet])

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
          const wallet = new Wallet(walletDataFromDB.publicKey, walletDataFromDB.privateKey);
          if (wallet) {
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

    const publicKey = wallet.publicKey;
    const privateKey = wallet.privateKey

    const dbData = {
      id: 'ECDSA_SECP256K1',
      publicKey,
      privateKey,
    };

    const openRequest = indexedDB.open('walletDatabase', 1);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction('wallets', 'readwrite');
      const walletsStore = transaction.objectStore('wallets');
      const request = walletsStore.put(dbData);

      request.onerror = () => {
        console.error('Error storing wallet data in indexedDB:', request.error);
      };
    };

    openRequest.onerror = () => {
      console.error('Error opening indexedDB:', openRequest.error);
    };

    return wallet as Wallet;
  };

  return (
    <Box mt="2" textAlign={'center'}>
      <Heading fontSize={'xl'} as='h3'>Address</Heading>
      <Code px='2' py='1'>{wallet?.classicAddress}</Code>
    </Box>
  );
};
