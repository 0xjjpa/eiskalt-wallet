import { NextApiRequest, NextApiResponse } from "next";
import * as Pusher from "pusher"

const {
  PUSHER_APP_ID: appId,
  PUSHER_KEY: key,
  PUSHER_SECRET: secret,
  PUSHER_CLUSTER: cluster,
} = process.env;

const pusher = new Pusher.default({
  appId,
  key,
  secret,
  cluster,
  useTLS: true
})

type Response = {
  status: string,
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {

  const { body: { id } } = req;
  await pusher.trigger(id, 'mobile-redirect', { id });
  res.json({ status: 'ok', message: id });
}