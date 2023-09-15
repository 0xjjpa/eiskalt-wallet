import { STEP } from "../components/MPCWallet/MPCWallet"
import BN from 'bn.js'
import { JsonObject, Encryptor, SignerP1, SignerP2 } from "@safeheron/two-party-mpc-adapter";
import { PubCurveBasePoint } from "@safeheron/two-party-mpc-adapter/dist/enc/Encryptor"
import { ec as EC } from 'elliptic';
import { mpcSDK } from "./mpc";
import { Supabase } from "./supabase";


export type WebsocketPayload = {
  id: string,
  instance: 1 | 2,
  step: STEP
  payload: string
}

type SupabaseWebsocketPayload = {
  event: string;
  payload: WebsocketPayload
}


export function cosignerHandler({ instance, keyshare, privKey, pubKey, channel }: { instance: 1 | 2, keyshare: JsonObject.JsonObject_KeyShare2 | JsonObject.JsonObject_KeyShare1, privKey: BN, pubKey: PubCurveBasePoint, channel: Supabase }) {
  let stepCounter = 0
  let signerP1, signerP2
  const txObject = {
    nonce: 0,
    to: "0x6442c72aBD1a9d14c303277a8C994Fae295b6BCB",
    value: 0,
    chainId: 5,
    data: '',
    maxFeePerGas: '100',
    maxPriorityFeePerGas: '1000',
    gasLimit: 21000
  }
  return async function cosignerListener(data: SupabaseWebsocketPayload) {
    const { payload } = data;
    if (payload.instance != instance) {
      const { step, payload: socketPayload } = payload;
      console.log(`(🪜,ℹ️) Step "${step}" obtained by device #${instance}, sent by ${payload.instance}`);
      switch (step) {
        case 'step_0': {
          const ec = new EC('secp256k1');
          if (instance == 1) {
            console.log('(0️⃣-💻,ℹ️) Step 0 to be executed in 💻');
            const parsed = JSON.parse(socketPayload);
            const otherDevicePubKey: PubCurveBasePoint = ec.curve.point(parsed.x, parsed.y);
            console.log('(🔑,ℹ️) PubKey parsed', pubKey, privKey, keyshare)
            signerP1 = new SignerP1(keyshare, Encryptor.encodeAuthPriv(privKey), Encryptor.encodeAuthPub(otherDevicePubKey))
            await signerP1.createContext(txObject)
            const message1 = await signerP1.step1()
            console.log('(💻,ℹ️) Signer for device 1 created, and signed message1', message1);

            // Ping for step_0
            mpcSDK({
              id: payload.id,
              step: "step_0",
              payload: JSON.stringify({
                x: pubKey.getX().toString("hex"),
                y: pubKey.getY().toString("hex"),
                message1
              }),
              instance,
              endpoint: "sign",
              client: "supabase",
              channel,
            });

          } else {
            console.log('(0️⃣-📱,ℹ️) Step 0 to be executed in 📱');
            console.log('(📦,ℹ️) Payload obtained', socketPayload)
            const parsed = JSON.parse(socketPayload);
            const otherDevicePubKey: PubCurveBasePoint = ec.curve.point(parsed.x, parsed.y);
            console.log('(🔑,ℹ️) PubKey parsed', pubKey, privKey, keyshare)
            console.log('(📦,ℹ️) Message from signer 1', parsed.message1);
            signerP2 = new SignerP2(keyshare, Encryptor.encodeAuthPriv(privKey), Encryptor.encodeAuthPub(otherDevicePubKey))
            const message2 = await signerP2.step1(JSON.stringify(txObject), parsed.message1)
            console.log('(📱,ℹ️) Signer for device 2 created, and signed message2.', message2)
          }
        }
      }
    }
    stepCounter++
    console.log("Handler Counter", stepCounter);
  }
}