import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from 'ethers'
import { parse } from "path";

type Response = {
  transactionHash?: string;
  status: string;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {

  const { body: { payload } } = req;

  const parsedTxData = ethers.utils.parseTransaction(payload)
  const faucetReceipt = await (await fetch(`https://hbar.rest/api/previewnet/accounts/${parsedTxData.from}/create`)).json()

  return res.json({ status: 'ok', transactionHash: faucetReceipt });
}

