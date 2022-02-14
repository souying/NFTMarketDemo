import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import "../assets/styles/SellDigitalAsset.css";

import NFT from "../contracts/NFT_ABI.json";
import Market from "../contracts/Mkt_ABI.json";
const nftaddress =
  "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";

const nftmarketaddress =
  "0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921";

let rpcEndpoint = "http://192.168.11.120:8545";

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
}

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
  }, []);
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider(rpcEndpoint);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(
      nftmarketaddress,
      Market.abi,
      provider
    );
    const data = await marketContract.fetchMarketItems();
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        let _tokenUri = tokenUri.replace(/"/gi, "");
        const meta = await axios.get(_tokenUri);

        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }
  // buyBtn
  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
    console.log(nft.itemId,nftaddress);
    const transaction = await contract.createMarketSale(
      nftaddress,
      nft.itemId,
      {
        value: price,
      }
    );
    
    await transaction.wait();
    loadNFTs();
  }

  // go back
  async function goBack() {
    await window.history.back(-1);
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1>No items in marketplace</h1>;

  return (
    <div className="SellDigitalAsset">
      <div className="SellDigitalAsset-Box" style={{ maxWidth: "1600px" }}>
        <div className="SellDigitalAsset-Box-Head">
          <h2>Sell Digital Asset</h2>
          <button onClick={goBack}>Go Back!</button>
        </div>
        <div className="SellDigitalAsset-Box-content">
          {nfts.map((nft, i) => (
            <div key={i} className="SellDigitalAsset-Box-content-item">
              <img src={nft.image} />
              <div className="SellDigitalAsset-Box-content-item-info">
                <p className="SellDigitalAsset-Box-content-item-info-name">
                  {nft.name}
                </p>
                <div style={{ height: "4rem", overflow: "hidden" }}>
                  <p
                    style={{ paddingLeft: "1rem", fontSize: "14px" }}
                    className="text-gray-400"
                  >
                    {nft.description}
                  </p>
                </div>
              </div>
              <div className="SellDigitalAsset-Box-content-item-Btn">
                <p
                  style={{
                    textIndent: "1rem",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {nft.price} ETH
                </p>
                <button onClick={() => buyNft(nft)}>Buy</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
