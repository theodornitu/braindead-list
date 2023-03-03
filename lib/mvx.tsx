import { start } from "repl";

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

    const response = await fetch('/api/getCollectionHolders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionIdentifier: cIdentifier, collectionType: cType, collectionSize: cSize }),
    });
    const data = await response.json();
    return data;
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