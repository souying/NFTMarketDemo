import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import "../assets/styles/CreatorDashboard.css";

import NFT from "../contracts/NFT_ABI.json";
import Market from "../contracts/Mkt_ABI.json";
const nftaddress = "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";

const nftmarketaddress = "0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921";

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [solds, setSolds] = useState([]);
  const [price, setPrice] = useState({
    price: "",
  });
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
    loadMarkets();
  }, []);
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await nftContract.fetchMyNFTs();

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        let _tokenUri = tokenUri.replace(/"/gi, "");
        const meta = await axios.get(_tokenUri);
        let item = {
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );
    /* create a filtered array of created items */
    setNfts(items);
    setLoadingState("loaded");
  }

  // 查询自己所出售的
  async function loadMarkets() {
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
    const tokendata = await marketContract.fetchItemsCreated();
    // console.log(data);
    const tokenitems = await Promise.all(
      tokendata.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          sold: i.sold,
          image: meta.data.image,
        };
        return item;
      })
    );
    /* create a filtered array of sold items and all items */
    const soldItems = tokenitems.filter((i) => i.sold);
    // sold
    setSold(soldItems);
    // all
    setSolds(tokenitems);
    setLoadingState("loaded");
  }

  if (loadingState === "loaded" && !nfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets created</h1>;

  // go back
  async function goBack() {
    await window.history.back(-1);
  }
  // put on the marketplace
  var _price = price;
  async function putOn(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    console.log(nft, nft.tokenId);

    const price = ethers.utils.parseUnits(_price, "ether");
    console.log(price);
    let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    let transaction = await contract.createMarketItem(
      nftaddress,
      nft.tokenId,
      price,
      {
        value: listingPrice,
      }
    );
    await transaction.wait();
    await window.location.replace("/sellDigitalAsset");
  }

  async function change(e) {
    console.log(e.target.value);
    setPrice(e.target.value);
  }

  return (
    <div>
      {/* 展示自己所创建的项目 */}
      <div className="p-4">
        <div className="CreatorDashboard-Head">
          <h2 className="text-2xl py-2">Items Created</h2>
          <button onClick={goBack}>Go Back!</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {nfts.map((nft, i) => (
            <div key={i} className="CreatorDashboard-items-Created">
              <img
                style={{
                  width: "16rem",
                  height: "17rem",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
                src={nft.image}
              />
              <div
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
              >
                <p
                  style={{ textAlign: "center" }}
                  className="text-2xl font-bold text-white"
                >
                  Price -
                  <input style={{ width: "3rem" }} onChange={change}></input>
                  &nbsp;Eth
                </p>
                <p style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    style={{ cursor: "pointer",border:'0',backgroundColor:'#fff' }}
                    onClick={putOn.bind(this, nft)}
                  >
                    Put on the shelf
                  </button>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* 展示已出售的项目 */}
      <div className="px-4">
        {Boolean(sold.length) && (
          <div className="CreatorDashboard">
            <h2 className="text-2xl py-2">Items sold</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {sold.map((nft, i) => (
                <div key={i} className="CreatorDashboard-items-sold">
                  <img
                    style={{
                      width: "16rem",
                      height: "17rem",
                      borderRadius: "0.5rem 0.5rem 0 0",
                    }}
                    src={nft.image}
                  />
                  <div className="p-4 bg-black">
                    <p style={{ textAlign: "center" }}>
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 展示所有的项目 */}
      <div className="px-4">
        {Boolean(solds.length) && (
          <div className="CreatorDashboard">
            <h2 className="text-2xl py-2">All Items</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {solds.map((nft, i) => (
                <div key={i} className="CreatorDashboard-items-sold">
                  <img
                    style={{
                      width: "16rem",
                      height: "17rem",
                      borderRadius: "0.5rem 0.5rem 0 0",
                    }}
                    src={nft.image}
                  />
                  <div className="p-4 bg-black">
                    <p style={{ textAlign: "center" }}>
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
