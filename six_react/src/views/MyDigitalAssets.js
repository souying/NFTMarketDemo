import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import "../assets/styles/MyDigitalAssets.css";

import NFT from "../contracts/NFT_ABI.json";
import Market from "../contracts/Mkt_ABI.json";
const nftaddress =
  "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";

const nftmarketaddress =
  "0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921";

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

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
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
              <img
                style={{ width: "16rem" }}
                src={nft.image}
                className="rounded"
              />
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
