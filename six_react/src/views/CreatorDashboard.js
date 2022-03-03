import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import "../assets/styles/CreatorDashboard.css";
import Model from "./Model.js";
import NFT from "../contracts/NFT_ABI.json";
import Market from "../contracts/Mkt_ABI.json";
import {nftaddress, nftmarketaddress } from '../config'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([]);
  const [sold, setSold] = useState([]);
  const [solds, setSolds] = useState([]);
  const [notSold, setNotSold] = useState([]);
  const [tokenUrii, setTokenUri] = useState(""); // 我创建的(用作判断的时候)
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
    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        if (i[4] != "") {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          // 赋值，为了给空盒子做判断
          setTokenUri(tokenUri);
          let mtl = `${tokenUri}/1.mtl`;
          let obj = `${tokenUri}/1.obj`;
          const meta = await axios.get(`${tokenUri}/test.json`);
          let item = {
            itemId: i.tokenId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            // image: meta.data.image,
            // image: tokenUri,
            addr: tokenUri,
            mtl,
            obj,
          };
          return item;
        } else {
          let item = {
            itemId: i.tokenId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
          };
          return item;
        }
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
    console.log(tokendata);
    const tokenitems = await Promise.all(
      tokendata.map(async (i) => {
        if (i == "") {
          alert("not-loaded");
        } else {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          let mtl = `${tokenUri}/1.mtl`;
          let obj = `${tokenUri}/1.obj`;
          const meta = await axios.get(`${tokenUri}/test.json`);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            itemId: i.itemId.toNumber(),
            // itemId: i.tokenId,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            addr: tokenUri,
            mtl,
            obj,
            // image: meta.data.image,
            // image: tokenUri,
          };
          return item;
        }
      })
    );
    /* create a filtered array of sold items and all items */
    // 筛选已出售的
    const soldItems = tokenitems.filter((i) => i.sold);
    console.log(soldItems);
    // 筛选未出售的(可下架)
    const notSoldItems = tokenitems.filter((i) => !i.sold);
    // sold(已出售的)
    setSold(soldItems);
    // notSold(未出售的)
    setNotSold(notSoldItems);
    // all(创建的+已出售的(下架等同于出售))
    setSolds(tokenitems);
    setLoadingState("loaded");
  }

  if (
    loadingState === "loaded" &&
    !nfts.length &&
    loadingState === "loaded" &&
    !sold.length &&
    loadingState === "loaded" &&
    !solds.length
  )
    return <h1 className="py-10 px-20 text-3xl">No assets created</h1>;

  // go back
  async function goBack() {
    await window.history.back(-1);
    // window.location.href = "/"; // 回到首页并刷新
  }
  // put on the marketplace
  var _price = price;
  async function putOn(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const price = ethers.utils.parseUnits(_price, "ether");
    let contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();

    let transaction = await contract.createMarketItem(
      nftaddress,
      nft.itemId,
      price,
      {
        value: listingPrice,
      }
    );
    await transaction.wait();
    await window.location.replace("/sellDigitalAsset");
  }

  async function change(e) {
    setPrice(e.target.value);
  }

  // 下架
  async function offShelf(nft) {
    console.log(nft);
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
    const tokendatas = await marketContract.recallSellingItem(
      nftaddress,
      nft.itemId
    );
    console.log(tokendatas);
    
  }

  // 销毁
  // const web3Modal = new Web3Modal();
  // const connection = await web3Modal.connect();
  // const provider = new ethers.providers.Web3Provider(connection);
  // const signer = provider.getSigner();

  // const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
  // const data = await nftContract.fetchMyNFTs();
  // const res = await nftContract.burnNFT(data[0].tokenId);
  // console.log(res);

  // 根据不同条件渲染不同组件
  function renderDiv() {
    const isTokenUrii = tokenUrii;
    if (isTokenUrii) {
      return (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {nfts.map((nft, i) => (
            <div key={i} className="CreatorDashboard-items-Created">
              {/* <img
                style={{
                  width: "16rem",
                  height: "17rem",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
                src={nft.image}
              /> */}
              <div
                className="model"
                style={{
                  width: "16rem",
                  height: "17rem",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <Model className="modelchild" data={nft} />
              </div>
              <div
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  borderRadius: "0 0 0.5rem 0.5rem",
                  flex: "1",
                }}
              >
                <p
                  style={{ textAlign: "center", margin: "0.8rem 0 0.8rem 0" }}
                  className="text-2xl font-bold text-white"
                >
                  Price -
                  <input style={{ width: "3rem" }} onChange={change}></input>
                  &nbsp;Eth
                </p>
                <p style={{ display: "flex", justifyContent: "center" }}>
                  <button
                    style={{
                      cursor: "pointer",
                      border: "0",
                      backgroundColor: "#80c342",
                      color: "#fff",
                      height: "1.5rem",
                      borderRadius: "1.5rem",
                      width: "8rem",
                    }}
                    onClick={putOn.bind(this, nft)}
                  >
                    Put on the shelf
                  </button>
                </p>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return <div></div>;
    }
  }

  return (
    <div>
      {/* 展示自己所创建的项目 */}
      <div className="p-4">
        <div className="CreatorDashboard-Head">
          <h2 className="text-2xl py-2">Items Created</h2>
          <button onClick={goBack}>Go Back!</button>
        </div>
        <div>{renderDiv()}</div>
      </div>
      {/* 展示已出售的项目 */}
      <div className="px-4">
        {Boolean(sold.length) && (
          <div className="CreatorDashboard">
            <h2 style={{ margin: "1rem" }}>Items sold</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {sold.map((nft, i) => (
                <div key={i} className="CreatorDashboard-items-sold">
                  <div
                    className="model"
                    style={{
                      width: "16rem",
                      height: "17rem",
                      borderRadius: "0.5rem 0.5rem 0 0",
                    }}
                  >
                    <Model className="modelchild" data={nft} />
                  </div>
                  <div style={{ flex: "1" }}>
                    <p style={{ textAlign: "center", paddingTop: "1rem" }}>
                      Price - {nft.price} Eth
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* 展示未出售的项目 */}
      <div className="px-4">
        {Boolean(notSold.length) && (
          <div className="CreatorDashboard">
            <h2 style={{ margin: "1rem" }}>Items notSold</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {notSold.map((nft, i) => (
                <div key={i} className="CreatorDashboard-items-notSold">
                  <div
                    className="model"
                    style={{
                      width: "16rem",
                      height: "17rem",
                      borderRadius: "0.5rem 0.5rem 0 0",
                    }}
                  >
                    <Model className="modelchild" data={nft} />
                  </div>
                  <div style={{ flex: "1", textAlign: "center" }}>
                    <p style={{ textAlign: "center", paddingTop: "1rem" }}>
                      Price - {nft.price} Eth
                    </p>
                    <button
                      style={{
                        backgroundColor: "#f60",
                        color: "#fff",
                        width: "5rem",
                        height: "1.5rem",
                        borderRadius: "1rem",
                        marginTop: "0.2rem",
                      }}
                      onClick={offShelf.bind(this, nft)}
                    >
                      下架
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 展示所有的项目(创建的+已出售的(下架等同于出售)) */}
      <div className="px-4" style={{ marginBottom: "2rem" }}>
        {Boolean(solds.length) && (
          <div className="CreatorDashboard">
            <h2 style={{ margin: "1rem" }}>All Items</h2>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {solds.map((nft, i) => (
                <div key={i} className="CreatorDashboard-items-all">
                  <div
                    className="model"
                    style={{
                      width: "16rem",
                      height: "17rem",
                      borderRadius: "0.5rem 0.5rem 0 0",
                    }}
                  >
                    <Model className="modelchild" data={nft} />
                  </div>
                  <div style={{ flex: "1" }}>
                    <p style={{ textAlign: "center", paddingTop: "1rem" }}>
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
