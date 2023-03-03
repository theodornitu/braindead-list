// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import BigNumber from "bignumber.js";

let computedCollection: {address: string, balance: number}[] = [];
let braindeadList: {
  address: string, 
  brainDeadListings: number, 
  brainDeadTxHashes: { txHash: string}[]
}[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  fetch('https://api.multiversx.com/collections/' + req.body.collectionIdentifier + '/accounts?size=' + req.body.collectionSize)
    .then((response) => response.json())
    .then((data) => {
      for(let i=0; i< req.body.collectionSize; i++){
        if(computedCollection.length == 0){
          // console.log('Address to be inserted: ' + data[i].address);
          // console.log('Balance to be inserted: ' + data[i].balance);
          computedCollection.push({address: data[i].address, balance: data[i].balance});
          // console.log("ComputedCollection data after first insert");
          // console.log(computedCollection);
        }
        else {
            var idx = -1
            idx = computedCollection.findIndex(item => item.address === data[i].address)
            // console.log('idx: ' + idx);
            if(idx != -1){
                computedCollection[idx].balance = +computedCollection[idx].balance + +1;
            }
            else{
                computedCollection.push({address: data[i].address, balance: data[i].balance});
            }
        }
      }
      computedCollection.sort((a: any, b: any) => b.balance - a.balance);
      // console.log("ComputedCollection final");
      // console.log(computedCollection);

      // console.log('CompColLen: ' + computedCollection.length);

      //for debug
      const slicedCollection = computedCollection.slice(0, 25);
      // computedCollection.forEach(async (item, i) => {
      slicedCollection.forEach(async (holder, i) => {
        await fetch('https://api.multiversx.com/collections/' + req.body.collectionIdentifier + '/transactions?size=100&sender=' + holder.address + '&status=success&function=' + 'auctionToken' + '&before=' + req.body.endDate + '&after=' + req.body.startDate)
          .then((response) => response.json())
          .then((data) => {
            // console.log('i: ' + i);
            // console.log('Init txhash array');
            let txHashList : { txHash: string }[] = [];

            // console.log("API Request #" + i + " based on user inputs");
            // console.log(apiAddr + 'collections/' + cIdentif + '/transactions?size=' + reqSize + '&sender=' + computedCollection[i].address + '&status=success&function=' + searchFunctionFrameIt + '&before=' + endDate.getTime()/1000 + '&after=' + startDate.getTime()/1000)
            
            // console.log('Sender #' + i + ': ' + computedCollection[i].address);
            // console.log('Search function: ' + searchFunctionFrameIt);
            // console.log('From date: ' + req.body.startDate);
            // console.log('To date: ' + req.body.endDate);
            // console.log('Response braindead');
            // console.log('braindead threshold: ' + braindeadThreshold);
            if(data.length != 0) {
              // console.log('data.length not equal 0: ' + data.length);
              // console.log(data);
              // console.log('init number of deadbrain listings ');
              let local_brainDeadListings: number = 0;
              for(let j = 0; j < data.length; j++)
              {
                // console.log(data[j].action.arguments);
                const bigValue =  new BigNumber(parseInt(data[j].action.arguments.functionArgs[0], 16))
                const braindeadAsBigValue = new BigNumber(parseInt(req.body.braindeadThreshold, 10));

                // console.log('listing price: ' + bigValue);
                // console.log('listing price denominated: ' + bigValue.shiftedBy(-18).decimalPlaces(3));
                // console.log('braindead as bigint: ' + braindeadAsBigValue);

                if(bigValue.shiftedBy(-18).decimalPlaces(3) < braindeadAsBigValue)
                {
                  // console.log(computedCollection[i].address + ' is braindead');
                  // console.log('pushing braindead txHash ' + data[j].txHash);
                  txHashList.push(data[j].txHash);
                  
                  local_brainDeadListings = local_brainDeadListings + 1;
                  // console.log('current braindead listings: ' + local_brainDeadListings);
                  
                  if(braindeadList.length == 0){
                    braindeadList.push(
                      {
                        address: holder.address,
                        brainDeadListings: local_brainDeadListings,
                        brainDeadTxHashes: txHashList
                      }
                    )
                  }
                  else{
                    var idx = -1;
                    idx = braindeadList.findIndex(item => item.address === computedCollection[i].address);
                    if(idx != -1){
                      braindeadList[idx].brainDeadTxHashes = txHashList;
                      braindeadList[idx].brainDeadListings = local_brainDeadListings;
                    }
                    else {
                      braindeadList.push(
                        {
                          address: holder.address,
                          brainDeadListings: local_brainDeadListings,
                          brainDeadTxHashes: txHashList
                        }
                      )
                    }
                  }
                }
              }
              local_brainDeadListings = 0;
            }
          })
      // }
      })
    })
    .then(() => {
      console.log('BrainDeadList');
      console.log(braindeadList);
      res.status(200).json(braindeadList);
    })
}
