import { render } from "@headlessui/react/dist/utils/render";
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import {getCollectionType, getCollectionSize, getCollectionOwners, getHolderActivity} from '../lib/mvx';
import ProgressBar from '../components/helpers/ProgressBar';

export default function Braindead() {

    //xoxno api 
    const xoCollectionAPI = 'https://proxy-api.xoxno.com/getCollectionOwners/'

    //elrond api
    const apiAddr = 'https://api.multiversx.com/';
    const reqCollection = 'https://api.multiversx.com/collections/';
    const reqNfts = 'https://api.multiversx.com/nfts/'
    const explorerTransactions = 'https://explorer.multiversx.com/transactions/'

    //addresses
    const FrameItAddress = 'erd1qqqqqqqqqqqqqpgq705fxpfrjne0tl3ece0rrspykq88mynn4kxs2cg43s';
    const XoxnoAddress = 'erd1qqqqqqqqqqqqqpgq6wegs2xkypfpync8mn2sa5cmpqjlvrhwz5nqgepyg8';
    const mferAddress = 'erd1hwhxmzrw6kkv793309dyxq2rstu4kcgup7lddtfeq7n65vpec6gqdzqqyp';
    const minterAddress = 'erd1qqqqqqqqqqqqqpgqdtq5ckfjlskcs5sf28dulh29hzapf00tc6gqaefu9c';

    // const cIdentif = 'SALAMIPASS-57afe8';
    const scSearchSize = 100; //for max tx req size when searching for braindead
    const scFnSearch_FrameIt = 'auctionToken';
    const txResultSuccess = 'success';


    const [cIdentif, setCIdentif] = useState('');
    const [apiProcessing, setApiProcessing] = useState(false);
    const [apiProgress, setApiProgress] = useState(0);

    const [startDate, setStartDate] = useState(new Date(2023,0,1));
    const [endDate, setEndDate] = useState(new Date(2023,0,2));
    const [braindeadThreshold, setBraindeadThreshold] = useState('');

    var stringStartDate;
    var stringEndDate;

    const [imgUrl, setImgUrl] = useState('');

    let computedCollection: {address: string, balance: number}[] = [];

    let braindeadList: { address: string, brainDeadListings: number, brainDeadTxHashes: string[] }[] = [];
    const [bdListState, setBDListState] = useState([{}]);

    const renderSwitch = (address: string | undefined) => {
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

    function sleep(milliseconds: number) {
        const date = Date.now();
        let currentDate = null;
        do {
          currentDate = Date.now();
        } while (currentDate - date < milliseconds);
      }

    // for debug
    async function doAsync() {
        const colType = await getCollectionType('BLXC-4311ab');
        console.log(colType);
        const colSize = await getCollectionSize('BLXC-4311ab');
        console.log(colSize);
        const colHolders = await getCollectionOwners('BLXC-4311ab');
        console.log(colHolders);
        const holderActivity = await getHolderActivity('erd10gzmysunqapyqxc4v0hp4h98yyyry3z4zeev5qapvpsvx3ztvjwqnhsxvp','BLXC-4311ab',1675209600,1677628800,'auctionToken',100,'success');
        console.log(holderActivity);
    }

    function clamp(input: number, min: number, max: number): number {
        return input < min ? min : input > max ? max : input;
    }
    function map(current: number, in_min: number, in_max: number, out_min: number, out_max: number): number {
        const mapped: number = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        return clamp(mapped, out_min, out_max);
    }

    async function callCompute() {
        try {
            //Get collection details
            setApiProcessing(true);
            setApiProgress(0);
            let currentRequest = 0;
            console.log('Getting collection holders');
            let colHolders = await getCollectionOwners(cIdentif);
            // console.log(colHolders);

            //debug
            // let temp = colHolders.splice(0,25);
            // colHolders = temp;
            // console.log('colHolders splice: ' + colHolders.length)
            //end of debug

            console.log('Checking for braindead holders within ' + colHolders.length + ' addresses');
            for(const holder of colHolders) {
                setApiProgress(Math.round(map(currentRequest,0,colHolders.length,0,100)));
                const holderActivity = await getHolderActivity(holder.address,cIdentif,startDate.getTime()/1000,endDate.getTime()/1000,scFnSearch_FrameIt,scSearchSize,txResultSuccess);
                sleep(550);
                currentRequest++;
                // console.log('API for: ' + holder.address);
                let txHashList : string[] = [];
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
            }
            // })
            setApiProcessing(false);
            setApiProgress(100);
            console.log('BrainDeadList');
            console.log(braindeadList);
            setBDListState(braindeadList);
        }
        catch(error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className="w-full">
                <label htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                >
                    collection identifier
                </label>
                <input
                    value={cIdentif}
                    onChange={event => {
                        setCIdentif(event.target.value)
                    }}
                    type="text"
                    name="data"
                    className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>
            </div>
            <div className="w-full">
                <label htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                    >
                        activity period
                </label>
                <ul className="relative flex flex-wrap list-none bg-transparent rounded-xl">
                    <li className="z-30 mr-2 flex-auto text-center">
                        <input
                            value={stringStartDate}
                            onChange={event => {
                                setStartDate(new Date(event.target.value + "T00:00:00"))
                            }}
                            type="text"
                            name="data"
                            placeholder="Start date (YYYY-MM-DD)"
                            className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>
                    </li>
                    <li className="z-30 ml-2 flex-auto text-center">
                        <input
                            value={stringEndDate}
                            onChange={event => {
                                setEndDate(new Date(event.target.value + "T00:00:00"))
                            }}
                            type="text"
                            name="data"
                            placeholder="End date (YYYY-MM-DD)"
                            className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>
                    </li>
                </ul>
            </div>
            <div className="w-full">
                <label htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                    >
                        braindead threshold (maximum egld price at listing)
                </label>
                <input
                    value={braindeadThreshold}
                    onChange={event => {
                        let input = event.target.value;
                        if(input.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/))
                            setBraindeadThreshold(input)
                    }}
                    type="text"
                    name="data"
                    placeholder="Show all walets which listed before this price"
                    className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>
            </div>
            <div className="w-full">
                <ul className="flex align-middle items-center list-none bg-transparent">
                    <li className="text-left">
                        <button type="button"
                                className="inline-flex items-center px-2.5 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={() => {callCompute()}}
                        >
                            compute
                        </button>
                    </li>
                    <li className="ml-2 w-full">
                        <ProgressBar progress={apiProgress} bgColor={'#9333ea'}/>
                    </li>
                </ul>
            </div>
            <div className="pb-10 pt-1">
                <table className="border-collapse border border-slate-500">
                    <thead>
                        <tr className="text-left">
                        <th className="border border-slate-600 px-4 bg-slate-100 ...">Address</th>
                        <th className="border border-slate-600 px-4 bg-slate-100 ...">Listings</th>
                        <th className="border border-slate-600 px-4 bg-slate-100 ...">Hashes</th>
                        </tr>
                    </thead>
                    <tbody >
                        {/* {reqResultState.map((item: any, index: number) => { */}
                        {bdListState.map((item: any, index: number) => {
                            return (
                                <tr key={item.address}>
                                    {renderSwitch(item.address)}
                                    <td className="border border-slate-600 text-center text-sm">{item.brainDeadListings}</td>
                                    <td className="border border-slate-600 text-center text-sm">
                                        <ul>
                                            
                                                {item.brainDeadTxHashes != null ? (
                                                    item.brainDeadTxHashes.map((txHash: string) => {
                                                        return (
                                                            <li key={txHash}>
                                                                <a 
                                                                    className="hover:underline text-blue-600" 
                                                                    target="_blank" 
                                                                    rel="noreferrer" 
                                                                    href={explorerTransactions + txHash}
                                                                >
                                                                    {txHash.substring(0,3) + "\u2026" + txHash.substring(txHash.length-3,txHash.length)}
                                                                </a>
                                                            </li>
                                                        )
                                                    })
                                                ) : (
                                                    <></>
                                                )}
                                        </ul>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </>
    )
}
;
