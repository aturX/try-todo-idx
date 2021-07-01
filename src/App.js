import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { MetaMaskButton, Text }from 'rimble-ui'
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { EthereumAuthProvider, ThreeIdConnect } from '@3id/connect'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver'
import Ceramic from '@ceramicnetwork/http-client'
import { IDX } from '@ceramicstudio/idx'
import { DID } from 'dids'


function App() {

  const [yourDID, setYourDID] = useState(null);
  const [yourAddress, setYourAddress] = useState(null);
  

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        infuraId: "" // required
      }
    }
  };

  // ethereum 
  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
  });
  
 
  // did  ceramic
  const threeIdConnect = new ThreeIdConnect()
  
  const authenticate = async () => {
    const ethProvider = await web3Modal.connect()
    const addresses = await ethProvider.enable()
    setYourAddress(addresses[0])
    const authProvider = new EthereumAuthProvider(ethProvider, addresses[0])
    await threeIdConnect.connect(authProvider)
  
    const ceramic = new Ceramic('https://ceramic-clay.3boxlabs.com')
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: ThreeIdResolver.getResolver(ceramic)
    })
  
    await did.authenticate()
    console.log(did.id)
    setYourDID(did.id)
  
    const jws = await did.createJWS({ hello: 'world' })
    console.log(jws)
  
    window.idx = new IDX({ ceramic })
    window.ceramic = ceramic
    window.did = did.id
  }
  
 
  return (
 
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          <MetaMaskButton size="large" onClick={authenticate}>Click me!</MetaMaskButton>
          
          
        </p> 
        <h3>
        <Text>你的DID： {yourDID}</Text>
        </h3> 
        <h3>
        <Text>你的地址：{yourAddress}</Text>
        </h3>   
      </header>
      </div>
   
  );
}

export default App;
