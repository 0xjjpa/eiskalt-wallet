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
  instance: number,
  step: string,
  status: string,
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {

  const { body: { id, instance, step, payload } } = req;
  await pusher.trigger(id, 'sign', { id, instance, step, payload });
  res.json({ status: 'ok', message: id, instance, step });
}