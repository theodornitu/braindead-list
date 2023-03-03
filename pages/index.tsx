import type {NextPage} from 'next'
import RequiresAuth from "../components/RequiresAuth";
import {useAuth} from "@elrond-giants/erd-react-hooks";
import {egldLabel} from "../config";
import {useState} from "react";
import {useTransaction} from "../hooks/useTransaction";
import {webWalletTxReturnPath} from "../utils/routes";

import Analytics from '../components/Analytics';
import Braindead from '../components/Braindead';

const Home: NextPage = () => {
    const {address, logout, env, balance, nonce} = useAuth();
    const [receiverAddress, setReceiverAddress] = useState('');
    const [txData, setTxData] = useState('');
    const {makeTransaction} = useTransaction();

    const [showAnalytics, setShowAnalytics] = useState(true);
    const [showBraindead, setShowBraindead] = useState(false);

    const sendTransaction = async () => {
        const txResult = await makeTransaction({
            receiver: receiverAddress,
            data: txData,
            value: 0.01,
            webReturnUrl: window.location.toString() + webWalletTxReturnPath,
        });
        setTxData('');
        setReceiverAddress('');
        console.log(txResult);
    };

    return (
        <RequiresAuth>
            <div className='float-right pr-4 pt-4'>
                <button type="button"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => {logout();}}
                >
                    Logout
                </button>
            </div>
            
            <div className="flex justify-center w-full mt-20">
                <div className="flex flex-col items-start space-y-2 max-w-screen-md">
                    <h2 className="text-xl">Welcome to braindead list!</h2>
                    <p className="text-sm">Here you&apos;ll be able to see who are the brain dead ppl that list below mint price lol</p>
                    <p className="text-sm">Address: {address}</p>
                    <p className="text-sm">You rich mf have: {balance.toDenominatedString() + egldLabel}</p>                    

                    <div className="w-full">
                        <ul className="relative flex flex-wrap list-none bg-transparent rounded-xl">
                            <li className="z-30 flex-auto text-center">
                                <button type="button"
                                    className="w-full text-center px-2.5 py-1.5 shadow-sm text-md font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => {
                                        setShowAnalytics(true);
                                        setShowBraindead(false);
                                    }}
                                >
                                    analytics
                                </button>
                            </li>
                            <li className="z-30 flex-auto text-center">
                                <button type="button"
                                    className="w-full px-2.5 py-1.5 shadow-sm text-md font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                    onClick={() => {
                                        setShowAnalytics(false);
                                        setShowBraindead(true);
                                    }}
                                >
                                    braindead
                                </button>                    
                            </li>
                        </ul>
                    </div>  
                    {showAnalytics && !showBraindead ? 
                    (
                        <Analytics />
                    ) : (
                        <Braindead />
                    )}


                    {/*verify if env is dev or test*/}
                    {/* {env === "devnet" && <div className="pt-6 w-full">
                        <p>Make a devnet test transaction</p>
                        <form className="space-y-4 pt-6 w-full">
                            <div className="w-full">
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700"
                                >
                                    Receiver Address
                                </label>
                                <input
                                    value={receiverAddress}
                                    onChange={event => {
                                        setReceiverAddress(event.target.value)
                                    }}
                                    type="text"
                                    name="address"
                                    className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>

                            </div>
                            <div className="w-full">
                                <label htmlFor="email"
                                       className="block text-sm font-medium text-gray-700"
                                >
                                    Transaction Data
                                </label>

                                <input
                                    value={txData}
                                    onChange={event => {
                                        setTxData(event.target.value)
                                    }}
                                    type="text"
                                    name="data"
                                    className="mt-1 p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"/>

                            </div>
                            <button type="button"
                                    className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        sendTransaction();
                                    }}
                            >
                                Sign devnet transaction
                            </button>
                        </form>
                    </div>
                    } */}
                </div>
            </div>
        </RequiresAuth>
    );
};

export default Home;

