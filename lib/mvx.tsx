import { start } from "repl";
import BigNumber from "bignumber.js";

// ----------------- API endpoints
//xoxno
export const xoCollectionAPI = 'https://proxy-api.xoxno.com/getCollectionOwners/'

//elrond
export const apiAddr = 'https://api.multiversx.com/';
export const reqCollection = 'https://api.multiversx.com/collections/';
export const reqNfts = 'https://api.multiversx.com/nfts/'
export const explorerTransactions = 'https://explorer.multiversx.com/transactions/'
// -----------------

// ----------------- Relevant addresses (SCs/ppl)
export const FrameItAddress = 'erd1qqqqqqqqqqqqqpgq705fxpfrjne0tl3ece0rrspykq88mynn4kxs2cg43s';
export const XoxnoAddress = 'erd1qqqqqqqqqqqqqpgq6wegs2xkypfpync8mn2sa5cmpqjlvrhwz5nqgepyg8';
export const mferAddress = 'erd1hwhxmzrw6kkv793309dyxq2rstu4kcgup7lddtfeq7n65vpec6gqdzqqyp';
export const minterAddress = 'erd1qqqqqqqqqqqqqpgqdtq5ckfjlskcs5sf28dulh29hzapf00tc6gqaefu9c';
// -----------------

export async function getCollectionType(cIdentifier: string): Promise<string> {
    const response = await fetch('/api/getCollectionType', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionIdentifier: cIdentifier }),
    });
    const data = await response.json();
    return data.result
};

export async function getCollectionSize(cIdentifier: string): Promise<number> {
    const cType = await getCollectionType(cIdentifier);

    const response = await fetch('/api/getCollectionSize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionIdentifier: cIdentifier, collectionType: cType }),
    });
    const data = await response.json();
    return data.result
};

export async function getCollectionOwners(cIdentifier: string): Promise<{address: string, balance: number}[]> {
    const cType = await getCollectionType(cIdentifier);
    console.log('cType: ' + cType);
    const cSize = await getCollectionSize(cIdentifier);
    console.log('cSize: ' + cSize);

    if (cType == 'SemiFungibleESDT') {
        const response = await fetch('/api/getCollectionSftHolders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ collectionIdentifier: cIdentifier, collectionType: cType, collectionSize: cSize }),
        });
        const data = await response.json();
        return data;
    }
    else if (cType == 'NonFungibleESDT') {
        const response = await fetch('/api/getCollectionNftHolders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ collectionIdentifier: cIdentifier, collectionType: cType, collectionSize: cSize }),
        });
        const data = await response.json();
        return data;
    }
    else
        return [{address: '', balance: 0}];
};

export async function getHolderActivity(holderAddress: string, cIdentifier: string, startDate: number, endDate: number, scFnSearch: string, scSearchSize: number, scTxStatus: string): Promise<{type: string, txHash: string, action: {arguments: {functionArgs: string[]}}}[]> {

    const response = await fetch('/api/getHolderActivity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ holderAddress: holderAddress, collectionIdentifier: cIdentifier, startDate: startDate, endDate: endDate, scFnSearch: scFnSearch, scSearchSize: scSearchSize, scTxStatus: scTxStatus }),
    });
    const data = await response.json();
    return data;
};

export const renderSwitch = (address: string | undefined) => {
    switch (address) {
        case XoxnoAddress:
            return (<td className="border border-slate-600 pl-4 pr-8 text-sm">XOXNO: Marketplace</td>);
        case FrameItAddress:
            return (<td className="border border-slate-600 pl-4 pr-8 text-sm">FrameIt: Marketplace</td>);
        case mferAddress:
            return (<td className="border border-slate-600 pl-4 pr-8 text-sm">mfer: salami boss</td>);
        case minterAddress:
            return (<td className="border border-slate-600 pl-4 pr-8 text-sm">FrameIt Minter: Smart contract</td>);
        default:
            return (<td className="border border-slate-600 pl-4 pr-8 text-sm">{address}</td>);
    }
}

export async function checkHolderActivity (braindeadList: { address: string, brainDeadListings: number, brainDeadTxHashes: string[] }[], holder: {address: string, balance: number}, holderActivity: any, braindeadThreshold: string): Promise<({address: string, brainDeadListings: number, brainDeadTxHashes: string[]}[])> {
    let txHashList : string[] = [];

    // console.log('API for: ' + holder.address);
    if(holderActivity.length != 0) {
        // console.log('data.length not equal 0: ' + holderActivity.length);
        // console.log(holderActivity);
        // console.log('init number of deadbrain listings ');
        let local_brainDeadListings: number = 0;
        for(let j = 0; j < holderActivity.length; j++)
        {
            // console.log(holderActivity[j].action.arguments);
            const bigValue =  new BigNumber(parseInt(holderActivity[j].action.arguments.functionArgs[0], 16))
            const braindeadAsBigValue = new BigNumber(parseFloat(braindeadThreshold));
            // console.log('listing price: ' + bigValue);
            // console.log('listing price denominated: ' + bigValue.shiftedBy(-18).decimalPlaces(3));
            // console.log('braindead as bigint: ' + braindeadAsBigValue);

            if(bigValue.shiftedBy(-18).decimalPlaces(3) < braindeadAsBigValue){
                // console.log('pushing braindead txHash ' + holderActivity[j].txHash);

                txHashList.push(holderActivity[j].txHash);
                local_brainDeadListings = local_brainDeadListings + 1;
                if(braindeadList.length == 0){
                    braindeadList.push({
                        address: holder.address,
                        brainDeadListings: local_brainDeadListings,
                        brainDeadTxHashes: txHashList
                    })
                }
                else{
                    var idx = -1;
                    idx = braindeadList.findIndex(item => item.address === holder.address);
                    if(idx != -1){
                    braindeadList[idx].brainDeadTxHashes = txHashList;
                    braindeadList[idx].brainDeadListings = local_brainDeadListings;
                    }
                    else {
                    braindeadList.push({
                        address: holder.address,
                        brainDeadListings: local_brainDeadListings,
                        brainDeadTxHashes: txHashList
                        })
                    }
                }
            }
        }
    }
    return braindeadList;
}

// export async function getBraindeadHolders(localCollectionSize: number) {

//         const response = await fetch('/api/getBraindeadHolders', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ collectionIdentifier: cIdentif, collectionSize: localCollectionSize, endDate: endDate.getTime()/1000, startDate: startDate.getTime()/1000, braindeadThreshold: braindeadThreshold }),
//         });
//         const data = await response.json();
//         console.log(data);
// }