// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

let computedCollection: {address: string, balance: number}[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // console.log('Entering API');
  // console.log('Collection size: ' + req.body.collectionSize);
  // console.log('Collection identifier: ' + req.body.collectionIdentifier);
  // console.log('Collection type: ' + req.body.collectionType);
  let response: any;
  let data: any;
  try {
    response = await fetch('https://api.multiversx.com/nfts/' + req.body.collectionIdentifier + '-01/accounts?size=' + req.body.collectionSize)
    data = await response.json();

    for(let i=0; i < req.body.collectionSize; i++){
      if(computedCollection.length == 0)
        computedCollection.push({address: data[i].address, balance: data[i].balance});
      else {
          var idx = -1
          idx = computedCollection.findIndex(item => item.address === data[i].address)
          if(idx != -1)
              computedCollection[idx].balance = +computedCollection[idx].balance + +1;
          else
              computedCollection.push({address: data[i].address, balance: data[i].balance});
      }
    }
    computedCollection.sort((a: any, b: any) => b.balance - a.balance);

    // console.log("ComputedCollection final");
    // console.log(computedCollection);
    return res.json(computedCollection);
  }
  catch(error) {
    console.log(error);
    return res.json({error: error});
  }
  
}
