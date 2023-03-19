import { start } from "repl";
import BigNumber from "bignumber.js";
import {base64Decode, base64ToHex, hexToBigInt, hexToNumber} from "../lib/misc"

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

export async function getHolderActivity(holderAddress: string, cIdentifier: string, startDate: number, endDate: number, scFnSearch: string, scSearchSize: number, scTxStatus: string, withScResults: boolean, withOperations: boolean, withLogs: boolean): Promise<{type: string, txHash: string, action: {arguments: {functionArgs: string[]}}}[]> {

    const response = await fetch('/api/getHolderActivity', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({  holderAddress: holderAddress, 
                                collectionIdentifier: cIdentifier, 
                                startDate: startDate, 
                                endDate: endDate, 
                                scFnSearch: scFnSearch, 
                                scSearchSize: scSearchSize, 
                                scTxStatus: scTxStatus, 
                                withScResults: withScResults, 
                                withOperations: withOperations, 
                                withLogs: withLogs }),
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
    // console.log('Holder activity: ' + holderActivity.length);
    // console.log('API for: ' + holder.address);
    // Expected minimum length = 1 (1 => listings only on one marketplace, 2 => listings on both marketplaces)
    if(holderActivity.length != 0) {
        // console.log('data.length not equal 0: ' + holderActivity.length);
        // console.log(holderActivity);
        // console.log('init number of deadbrain listings ');

        let local_brainDeadListings: number = 0;
        const braindeadAsBigValue = new BigNumber(parseFloat(braindeadThreshold));
        // console.log('braindead as bigint: ' + braindeadAsBigValue);

        if(holderActivity[0].length != 0){
            //Step 1: FrameIt (holderActivity[0] is holding FrameIt listings)
            for(let j = 0; j < holderActivity[0].length; j++){
                // console.log(holderActivity[j].action.arguments);

                const bigValue =  new BigNumber(parseInt(holderActivity[0][j].action.arguments.functionArgs[0], 16))
                console.log('Listed on FrameIt for: ' + bigValue.shiftedBy(-18).decimalPlaces(3));

                if(bigValue.shiftedBy(-18).decimalPlaces(3) < braindeadAsBigValue){
                    // console.log('pushing braindead txHash ' + holderActivity[0][j].txHash);
                    txHashList.push(holderActivity[0][j].txHash);
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
        if(holderActivity[1].length != 0){
            //Step 2: Xoxno (holderActivity[1] is holding Xoxno listings)
            for(let j = 0; j < holderActivity[1].length; j++){
                console.log(holderActivity[1][j]);
                console.log('events: ' + holderActivity[1][j].logs.events.length);

                var bigValue = new BigNumber(999); 
                var listPrice = new BigNumber(999);

                //Go through logs and check for listing price
                //Part1: check if typical tx logs (with 3 event logs that contain 'listing' topics)
                if(holderActivity[1][j].logs.events.length > 1){
                    // console.log('case1');
                    if(holderActivity[1][j].logs.events.length <= 3){
                        bigValue =  new BigNumber(hexToNumber(base64ToHex(holderActivity[1][j].logs.events[1].topics[6])));
                        listPrice = bigValue.shiftedBy(-18).decimalPlaces(4);
                        console.log('Found less than 3 <events> => Normal listing for: ' + listPrice);
                    }
                    else{
                        let foundListing: boolean = false;
                        console.log('Searching through ' + holderActivity[1][j].logs.events.length + ' <events>');
                        for(let k = 0; k < holderActivity[1][j].logs.events.length; k++){
                            if(holderActivity[1][j].logs.events[k].identifier == 'listing'){
                                let tempBigValue = new BigNumber(hexToNumber(base64ToHex(holderActivity[1][j].logs.events[k].topics[6])));
                                listPrice =  new BigNumber(Math.min(tempBigValue.shiftedBy(-18).decimalPlaces(4).toNumber(),listPrice.toNumber()));
                                foundListing = true;
                                console.log('Found listing on Xoxno for: ' + listPrice);
                            }
                        }
                        if(foundListing == false){
                            console.log('Listing not found within <logs> section, searching in <results>');
                            if(holderActivity[1][j].hasOwnProperty('results')){
                                console.log('<results> exists, searching through ' + holderActivity[1][j].results.length + ' <results>')
                                for(let k = 0; k < holderActivity[1][j].results.length; k++){
                                    if(holderActivity[1][j].results[k].hasOwnProperty('logs')){
                                        console.log('Searching through ' + holderActivity[1][j].results[k].logs.events.length + ' <events> within <results>')
                                        for(let o = 0; o < holderActivity[1][j].results[k].logs.events.length; o++){
                                            if(holderActivity[1][j].results[k].logs.events[o].identifier == 'listing'){
                                                let tempBigValue =  new BigNumber(hexToNumber(base64ToHex(holderActivity[1][j].results[k].logs.events[o].topics[6])));
                                                listPrice = new BigNumber(Math.min(tempBigValue.shiftedBy(-18).decimalPlaces(4).toNumber(),listPrice.toNumber()));
                                                console.log('Found listing on Xoxno for: ' + listPrice);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                else{
                    // console.log('case2');
                    //Part2: check results object for 'listing' topics
                    for(let resultIterator = 0; resultIterator < holderActivity[1][j].results.length; resultIterator++){
                        // console.log('has logs? ' + holderActivity[1][j].results[resultIterator].hasOwnProperty('logs'));
                        if(holderActivity[1][j].results[resultIterator].hasOwnProperty('logs')){
                            // console.log('events:' + holderActivity[1][j].results[resultIterator].logs.events.length);
                            for(let eventIterator = 0; eventIterator < holderActivity[1][j].results[resultIterator].logs.events.length; eventIterator++){
                                // console.log('has identifier?: ' + holderActivity[1][j].results[resultIterator].logs.events[eventIterator].hasOwnProperty('identifier'));
                                if(holderActivity[1][j].results[resultIterator].logs.events[eventIterator].hasOwnProperty('identifier')){
                                    if(holderActivity[1][j].results[resultIterator].logs.events[eventIterator].identifier == "listing"){
                                        // console.log('Found listing');
                                        console.log(holderActivity[1][j].results[resultIterator].logs.events[eventIterator]);
                                        let tempBigValue =  new BigNumber(hexToNumber(base64ToHex(holderActivity[1][j].results[resultIterator].logs.events[eventIterator].topics[6])));
                                        listPrice = new BigNumber(tempBigValue.shiftedBy(-18).decimalPlaces(4))
                                    }
                                }
                            }
                        }
                    }
                }
                console.log('Listed on Xoxno for: ' + listPrice);

                if(listPrice < braindeadAsBigValue){
                    // console.log('pushing braindead txHash ' + holderActivity[0][j].txHash);
                    txHashList.push(holderActivity[1][j].txHash);
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