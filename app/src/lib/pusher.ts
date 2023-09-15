import { STEP } from "../components/MPCWallet/MPCWallet"
import BN from 'bn.js'
import { JsonObject, Encryptor, SignerP1, SignerP2 } from "@safeheron/two-party-mpc-adapter";
import { PubCurveBasePoint } from "@safeheron/two-party-mpc-adapter/dist/enc/Encryptor"
import { ec as EC } from 'elliptic';


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


export function cosignerHandler({ instance, keyshare, privKey }: { instance: 1 | 2, keyshare: JsonObject.JsonObject_KeyShare2 | JsonObject.JsonObject_KeyShare1, privKey: BN }) {
  let counter = 0
  let signerP1, signerP2
  return async function cosignerListener(data: SupabaseWebsocketPayload) {
    console.log("Listener Data", data);
    const { payload } = data;
    if (payload.instance != instance) {
      const { step, payload: socketPayload } = payload;
      console.log('(🪜,ℹ️) Step obtained', step);
      switch (step) {
        case 'step_0': {
          console.log('(0️⃣,ℹ️) Step 0 to be executed');
          const ec = new EC('secp256k1');
          const parsed = JSON.parse(socketPayload);
          const pubKey: PubCurveBasePoint = ec.curve.point(parsed.x, parsed.y);
          console.log('(🔑,ℹ️) PubKey parsed', pubKey, privKey, keyshare)
          if (instance == 1) {
            signerP1 = new SignerP1(keyshare, Encryptor.encodeAuthPriv(privKey), Encryptor.encodeAuthPub(pubKey))
            console.log('(💻,ℹ️) Signer for device 1 created');
          } else {
            signerP2 = new SignerP2(keyshare, Encryptor.encodeAuthPriv(privKey), Encryptor.encodeAuthPub(pubKey))
            console.log('(📱,ℹ️) Signer for device 2 created.')
          }
        }
      }
    }
    counter++
    console.log("Handler Counter", counter);
  }
}