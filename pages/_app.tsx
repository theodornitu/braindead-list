import '../styles/globals.css'
import type {AppProps} from 'next/app'
import store from "../redux/store";
import {Provider as ReduxProvider} from "react-redux";
import Notifications from "../components/Notifications";
import {AuthContextProvider} from "@elrond-giants/erd-react-hooks";
import {networkEnv} from "../config";


function MyApp({Component, pageProps}: AppProps) {
    return (
        <ReduxProvider store={store}>
            <AuthContextProvider env={networkEnv == "mainnet" ? "mainnet" : "devnet"}>
                <Component {...pageProps} />
                <Notifications/>
            </AuthContextProvider>
        </ReduxProvider>
    );
}

export default MyApp
