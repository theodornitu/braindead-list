// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

let computedCollection: {address: string, balance: number}[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // console.log('Collection identifier: ' + req.body.collectionIdentifier);
  // console.log('scSkipResults: ' + requ.body.scSkipResults);
  // console.log('scSearchSize: ' + req.body.scSearchSize);
  // console.log('endDate: ' + req.body.endDate);
  // console.log('startDate: ' + req.body.startDate);

  // console.log('https://api.multiversx.com/collections/' + req.body.collectionIdentifier + '/transactions?' + 
  //   'from=' + req.body.scSkipResults +
  //   '&size=' + req.body.scSearchSize +
  //   '&status=' + 'success' + 
  //   '&before=' + req.body.endDate + 
  //   '&after=' + req.body.startDate)

  const response = await fetch(
    'https://api.multiversx.com/collections/' + req.body.collectionIdentifier + '/transactions?' + 
    'from=' + req.body.scSkipResults +
    '&size=' + req.body.scSearchSize +
    '&status=' + 'success' + 
    '&before=' + req.body.endDate + 
    '&after=' + req.body.startDate
  )

  // console.log("Response: " + response);
  // console.log("Response status: " + response.status);
  // console.log("Response text: " + response.statusText)
    if(response.status == 200) {
      const data = await response.json();
      // console.log(data);
      res.status(200).json(data);
    }
    else {
      res.status(response.status).json({ status: response.statusText});
    }
}
