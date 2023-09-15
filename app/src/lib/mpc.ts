import { STEP } from "../components/MPCWallet/MPCWallet";

export const mpcSDK = async ({ id, instance, step, payload, endpoint = "step" }: { id: string, instance: number, step: STEP, payload: string, endpoint?: string }) => {
  console.log("(⚙️,ℹ️) MPC SDK - Triggering step...");
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