import { STEP } from "../components/MPCWallet/MPCWallet"

export type WebsocketPayload = {
  id: string,
  instance: 1 | 2,
  step: STEP
  payload: string
}

export function cosignerHandler({ instance }: { instance: 1 | 2}) {
  let counter = 0
  return function cosignerListener(data: WebsocketPayload) {
    console.log("Listener Data", data);
    if (data.instance != instance) {
      console.log("I received a messsage from someone else.")
    }
    counter++
    console.log("Handler Counter", counter);
  }
}