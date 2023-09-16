import { STEP } from "../components/MPCWallet/MPCWallet";
import { Supabase } from "./supabase";

export const mpcSDK = async ({ id, instance, step, payload, endpoint = "step", client = "pusher", channel }: { id: string, instance: number, step: STEP, payload: string, endpoint?: string, client?: "pusher" | "supabase", channel?: Supabase }) => {
  console.log("(⚙️,ℹ️) MPC SDK - Triggering step...", payload);
  if (client == "pusher") {
    const response = await (
      await fetch(`/api/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, instance, step, payload }),
      })
    ).json();
    console.log("(⚙️,ℹ️) MPC SDK - Step sent", response);
    return response;
  }
  if (client == "supabase") {
    channel.send("sign", { id, instance, step, payload })
  }
  return { error: "No client found" }
}