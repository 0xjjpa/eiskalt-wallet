import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from 'ethers'
import { parse } from "path";

type Response = {
  transactionHash?: string;
  status: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {

  const { body: { payload } } = req;

  const parsedTxData = ethers.utils.parseTransaction(payload)
  const provider = new ethers.providers.JsonRpcProvider("https://previewnet.hashio.io/api");
  const faucetReceipt = await (await fetch(`https://hbar.rest/api/previewnet/accounts/${parsedTxData.from}/create`)).json()

  if (faucetReceipt) {
    const txResponse = await provider.sendTransaction(payload);
    return res.json({ status: 'ok', transactionHash: txResponse.hash });
  }

  return res.json({ status: 'err' });
}