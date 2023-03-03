// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  const response = await fetch('https://api.multiversx.com/collections/' + req.body.collectionIdentifier)
  const data = await response.json();

  res.status(200).json({ result: data.type});
}
