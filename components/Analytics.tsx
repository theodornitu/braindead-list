import { render } from "@headlessui/react/dist/utils/render";
import { useEffect, useState } from "react";


export default function Analytics() {

    //xoxno api 
    const xoCollectionAPI = 'https://proxy-api.xoxno.com/getCollectionOwners/'

    //elrond api
    const reqCollection = 'https://api.multiversx.com/collections/';
    const reqNfts = 'https://api.multiversx.com/nfts/'

    //addresses
    const FrameItAddress = 'erd1qqqqqqqqqqqqqpgq705fxpfrjne0tl3ece0rrspykq88mynn4kxs2cg43s';
    const XoxnoAddress = 'erd1qqqqqqqqqqqqqpgq6wegs2xkypfpync8mn2sa5cmpqjlvrhwz5nqgepyg8';
    const mferAddress = 'erd1hwhxmzrw6kkv793309dyxq2rstu4kcgup7lddtfeq7n65vpec6gqdzqqyp';
    const minterAddress = 'erd1qqqqqqqqqqqqqpgqdtq5ckfjlskcs5sf28dulh29hzapf00tc6gqaefu9c';

    // const cIdentif = 'SALAMIPASS-57afe8';
    // const reqSize = 300;
    var reqResult;
    const [reqResultState, setReqResultState] = useState([]);
    const [reqResultStateWithType, setReqResultStateWithType] = useState([{address: '', balance: 0}]);

    const [nftHolderCount, setNftHolderCount] = useState(0);
    const [cIdentif, setCIdentif] = useState('');
    const [compute, setCompute] = useState(false);
    const [apiProcessing, setApiProcessing] = useState(false);
    const [collectionSize, setCollectionSize] = useState(0);

    const [imgUrl, setImgUrl] = useState('');


    let computedCollection: {address: string, balance: number}[] = [];

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

    //Get holders of a collection and sort based on number of NFTs/SFTs owned, descending
    function callCompute() {
        //Get collection details
        setApiProcessing(true);
        fetch('https://api.multiversx.com/collections/' + cIdentif)
            .then((response) => response.json())
            .then((data) => {
                console.log('Token Type: ' + data.type)
                //Branch for SFTs which have better API implementation
                if(data.type == 'SemiFungibleESDT')
                {
                    //Set API processing true = loading screen
                    //Check holders count for SFT
                    fetch('https://api.multiversx.com/nfts/' + cIdentif + '-01/accounts/count')
                        .then((response) => response.json())
                        .then((data) => {
                            console.log('Tokens in collection: ' + data);
                            fetch('https://api.multiversx.com/nfts/' + cIdentif + '-01/accounts?size=' + data)
                                .then((response) => response.json())
                                .then((data) => {
                                    data.sort((a: any, b: any) => b.balance - a.balance);
                                    setCollectionSize(1);
                                    setReqResultStateWithType(data);
                                    setApiProcessing(false);
                                })
                        })
                }
                //Branch for NFTs which have worse API implementation
                if(data.type == 'NonFungibleESDT') {
                    //Check collection size
                    fetch('https://api.multiversx.com/collections/' + cIdentif + '/nfts/count')
                        .then((response) => response.json())
                        .then((data) => {
                            console.log('Colelction size: ' + data);
                            setCollectionSize(data);
                            //UseEffect below will take care of the rest
                        })
                }
            })

        .catch((err) => {
            console.log(err.message);
        });
    }

    useEffect(() => {
        if(collectionSize != 1){
            fetch('https://api.multiversx.com/collections/' + cIdentif + '/accounts?size=' + collectionSize)
                .then((response) => response.json())
                .then((data) =>{
                    console.log('Response data');
                    console.log(data);
                    // console.log("ComputedCollection data");
                    // console.log(computedCollection);
                    for(let i=0; i< collectionSize; i++){
                        // console.log('i: ' + i);
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
                    console.log("ComputedCollection data after first insert");
                    console.log(computedCollection);
                    computedCollection.sort((a: any, b: any) => b.balance - a.balance);
                    setReqResultStateWithType(computedCollection);
                    setApiProcessing(false);
                })
            }
    }, [collectionSize, cIdentif]);

    function callComputeXo() {
        fetch(xoCollectionAPI + cIdentif)
        .then((response) => response.json())
            .then((data) => {
                console.log(data);
                console.log(data.hodlersInfo);
                console.log(data.hodlersInfo.hodlers);
                setReqResultState(data.hodlersInfo.hodlers);
            })
        .catch((err) => {
            console.log(err.message);
        });
    }

    useEffect(() => {
        if(apiProcessing == true)
          setImgUrl("loading.gif");
       }, [apiProcessing]);

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
            <button type="button"
                    className="inline-flex items-center px-2.5 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => {
                        // callComputeXo();
                        callCompute();
                    }}
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
                            {/* {reqResultState.map((item: any, index: number) => { */}
                            {reqResultStateWithType.map((item: any, index: number) => {
                                return (
                                    <tr key={item.address}>
                                        {renderSwitch(item.address)}
                                        <td className="border border-slate-600 text-center text-sm">{item.balance}</td>
                                        {/* <td className="border border-slate-600 text-center text-sm">{item.count}</td> */}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
            )} 
            
        </>
    )
}
;
