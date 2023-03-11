// React stuff
import { useEffect, useState } from "react";
import BigNumber from "bignumber.js";

// My mvx lib
import {getCollectionType, getCollectionSize, getCollectionOwners, getHolderActivity, checkHolderActivity} from '../lib/mvx'; //API endpoints
import {xoCollectionAPI, XoxnoAddress, FrameItAddress, mferAddress, minterAddress} from '../lib/mvx'; //consts
import {apiAddr, reqCollection, reqNfts, explorerTransactions} from '../lib/mvx'; //consts
import {renderSwitch} from '../lib/mvx'; //methods

// My components
import ProgressBar from '../components/helpers/ProgressBar';

// Misc lib
import {sleep, map} from '../lib/misc';

export default function Analytics() {


    // ui related
    const [apiProgress, setApiProgress] = useState(0);
    const [apiProcessing, setApiProcessing] = useState(false);
    const [imgUrl, setImgUrl] = useState('');

    // back end related
    const [cIdentif, setCIdentif] = useState('');
    const [collectionSize, setCollectionSize] = useState(0);
    const [reqResultStateWithType, setReqResultStateWithType] = useState([{address: '', balance: 0}]);

    //Get holders of a collection and sort based on number of NFTs/SFTs owned, descending
    async function callCompute() {
        setApiProgress(0);
        setApiProcessing(true);

        let colSize = await getCollectionSize(cIdentif);
        setCollectionSize(colSize);
        setApiProgress(50);

        let colHolders = await getCollectionOwners(cIdentif);
        setReqResultStateWithType(colHolders);
        setApiProgress(100);
        setApiProcessing(false);        
    }

    useEffect(() => {
        if(apiProcessing == true)
          setImgUrl("loading.gif");
       }, [apiProcessing]);

    return (
        <>
            <div className="w-full">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    collection identifier
                </label>
                <input
                    value={cIdentif}
                    onChange={event => {setCIdentif(event.target.value)}}
                    type="text"
                    name="data"
                    className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>
            </div>
            <button type="button"
                    className="inline-flex items-center px-2.5 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {callCompute()}}
            >
                compute
            </button>
            <p className="text-sm text-gray-700">
                NFTs:  
                <span className="text-gray-900 mr-2"> {collectionSize}</span>
                Hodlers:  
                <span className="text-gray-900"> {reqResultStateWithType.length}</span>
            </p>
            {apiProcessing ? (
                <img 
                    src={imgUrl} 
                    className="rounded-4 shadow-soft-xl backdrop-blur-2xl backdrop-saturate-200 w-120 h-120 sm-max:w-80 sm-max:h-80"
                ></img>
                ) : (
                    <table className="border-collapse border border-slate-500 ...">
                        <thead>
                            <tr className="text-left">
                            <th className="border border-slate-600 px-4 bg-slate-100 ...">Wallet</th>
                            <th className="border border-slate-600 px-4 bg-slate-100 ...">Salami Size</th>
                            </tr>
                        </thead>
                        <tbody >
                            {reqResultStateWithType.map((item: any, index: number) => {
                                return (
                                    <tr key={item.address}>
                                        {renderSwitch(item.address)}
                                        <td className="border border-slate-600 text-center text-sm">{item.balance}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
            )} 
        </>
    )
};
