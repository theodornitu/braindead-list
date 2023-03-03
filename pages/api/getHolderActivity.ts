// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

let computedCollection: {address: string, balance: number}[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // console.log('Holder address: ' + req.body.holderAddress);
  // console.log('Collection identifier: ' + req.body.collectionIdentifier);
  // console.log('scSearchSize: ' + req.body.scSearchSize);
  // console.log('scTxStatus: ' + req.body.scTxStatus);
  // console.log('scFnSearch: ' + req.body.scFnSearch);
  // console.log('endDate: ' + req.body.endDate);
  // console.log('startDate: ' + req.body.startDate);

  const response = await fetch(
    'https://api.multiversx.com/collections/' + req.body.collectionIdentifier + '/transactions?' + 
    'size=' + req.body.scSearchSize +
    '&sender=' + req.body.holderAddress + 
    '&status=' + req.body.scTxStatus + 
    '&function=' + req.body.scFnSearch + 
    '&before=' + req.body.endDate + 
    '&after=' + req.body.startDate
  )
  // console.log(response);
    const data = await response.json();
    // console.log(data);
    res.status(200).json(data);
}
