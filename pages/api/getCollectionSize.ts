// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // console.log('Entering API');
  // console.log('Collection type: ' + req.body.collectionType);
  // console.log('Collection identifier: ' + req.body.cIdentifier);

  switch (req.body.collectionType) {
    case 'SemiFungibleESDT':{
      const response = await fetch('https://api.multiversx.com/nfts/' + req.body.collectionIdentifier + '-01/accounts/count')
      const data = await response.json();
      // console.log('SFT');
      res.status(200).json({ result: data});
      break;
      }
    case 'NonFungibleESDT':{
      const response = await fetch('https://api.multiversx.com/collections/' + req.body.collectionIdentifier + '/nfts/count')
      const data = await response.json();
      // console.log('NFT');
      res.status(200).json({ result: data});
      break;
      } 
    }

}
