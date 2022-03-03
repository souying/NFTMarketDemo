import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import "../assets/styles/MyDigitalAssets.css";
import Model from "./Model.js";

import NFT from "../contracts/NFT_ABI.json";
import Market from "../contracts/Mkt_ABI.json";

import {nftaddress, nftmarketaddress } from '../config'

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      signer
    );
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await marketContract.fetchMyNFTs();
    // console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        console.log(tokenUri);
        let mtl = `${tokenUri}/1.mtl`;
        console.log(mtl);
        let obj = `${tokenUri}/1.obj`;
        const meta = await axios.get(`${tokenUri}/test.json`);
        console.log(meta);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          // image: meta.data.image,
          addr: tokenUri,
          mtl,
          obj,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;

  // go back
  async function goBack() {
    await window.history.back(-1);
  }

  return (
    <div className="MyDigitalAssets">
      <div className="MyDigitalAssets-" style={{ padding: "0.5rem" }}>
        <div className="MyDigitalAssets-Head">
          <h2>My Digital Assets</h2>
          <button onClick={goBack}>Go Back!</button>
        </div>

        <div className="MyDigitalAssets-Box">
          {nfts.map((nft, i) => (
            <div key={i} className="MyDigitalAssets-Box-item">
              <div
                className="model"
                style={{
                  width: "16rem",
                  height: "14rem",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <Model className="modelchild" data={nft} />
              </div>
              <div className="MyDigitalAssets-Box-item-info">
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
              </div>
              <div className="MyDigitalAssets-Box-item-price">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
