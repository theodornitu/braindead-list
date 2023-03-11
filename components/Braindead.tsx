// React stuff
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";

// My mvx lib
import {getCollectionType, getCollectionSize, getCollectionOwners, getHolderActivity, checkHolderActivity} from '../lib/mvx'; //API endpoints
import {XoxnoAddress, FrameItAddress, mferAddress, minterAddress} from '../lib/mvx'; //consts
import {apiAddr, reqCollection, reqNfts, explorerTransactions} from '../lib/mvx'; //consts
import {renderSwitch} from '../lib/mvx'; //methods

// My components
import ProgressBar from '../components/helpers/ProgressBar';

// Misc lib
import {sleep, map} from '../lib/misc';


export default function Braindead() {

    // ----------------- API request consts for search
    const scSearchSize = 100; //for max tx req size when searching for braindead
    const txResultSuccess = 'success';

    const scFnSearch_FrameIt = 'auctionToken'; //frameit SC method
    const scFnSearch_Xoxno = 'listing'; //xoxno SC method
    // -----------------

    // ----------------- States & Hooks
    // collection related
    const [cIdentif, setCIdentif] = useState('');

    // ui related
    const [apiProgress, setApiProgress] = useState(0);
    const [bdListState, setBDListState] = useState([{}]);

    // back end related
    const [startDate, setStartDate] = useState(new Date(2023,0,1));
    const [endDate, setEndDate] = useState(new Date(2023,0,2));
    const [braindeadThreshold, setBraindeadThreshold] = useState('');
    // -----------------

    // ----------------- Variables for intermidiate results computation
    // dates
    var stringStartDate;
    var stringEndDate;
    let braindeadList: { address: string, brainDeadListings: number, brainDeadTxHashes: string[] }[] = [];
    // -----------------

    async function callCompute() {
        try {
            //Get collection details
            setApiProgress(0);
            let currentRequest = 0;
            let colHolders = await getCollectionOwners(cIdentif);
            // console.log('Collection holders');
            // console.log(colHolders);

            //debug
            // let temp = colHolders.splice(0,25);
            // colHolders = temp;
            // console.log('colHolders splice: ' + colHolders.length)
            //end of debug

            console.log('Checking for braindead holders within ' + colHolders.length + ' addresses');
            for(const holder of colHolders) {

                setApiProgress(Math.round(map(currentRequest,0,colHolders.length,0,100)));
                currentRequest++;

                const holderActivity = await getHolderActivity(holder.address,cIdentif,startDate.getTime()/1000,endDate.getTime()/1000,scFnSearch_FrameIt,scSearchSize,txResultSuccess);
                sleep(550);

                braindeadList = await checkHolderActivity(braindeadList, holder, holderActivity, braindeadThreshold);
            }
            setApiProgress(100);
            console.log('BrainDeadList');
            braindeadList.sort((a: any, b: any) => b.brainDeadListings - a.brainDeadListings)
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
