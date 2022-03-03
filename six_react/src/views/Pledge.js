import React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import Model from "./Model.js";
import "../assets/styles/Pledge.css";
import NFT from "../contracts/NFT_ABI.json";
import { nftaddress } from "../config";
export default function Pledge() {
  const [nfts, setNfts] = useState([]); // 查询到自己所创建的NFT
  const [pNfts, setPnfts] = useState([]); // 查询到自己所质押的NFT
  const [loadingState, setLoadingState] = useState("not-loaded");
  useEffect(() => {
    loadNFTs();
    pledgedNFTs();
  }, []);

  // 查询到自己所创建的NFT
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
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        let mtl = `${tokenUri}/1.mtl`;
        let obj = `${tokenUri}/1.obj`;
        const meta = await axios.get(`${tokenUri}/test.json`);
        // let price = ethers.utils.formatUnits(i.price.toString(), "ether");
        let item = {
          // price,
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
        console.log(item);
        return item;
      })
    );
    setNfts(items);
    setLoadingState("loaded");
  }

  // 查询到自己所质押的NFT
  async function pledgedNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
    // const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const data = await nftContract.fetchMyPledgeNFTs();
    console.log(data);
    setPnfts(data);
    setLoadingState("loaded");
  }

  if (loadingState === "loaded" && !nfts.length && !pNfts.length)
    return <h1 className="py-10 px-20 text-3xl">No assets owned</h1>;

  // go back
  async function goBack() {
    await window.history.back(-1);
  }

  // 质押
  async function pledge(nft) {
    console.log(nft);
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

    const data = await nftContract.pledgeNFT(nft.tokenId);
    // await data.wait();
    console.log(data);

    await tokenContract.on("Pledge", (author, event) => {
      console.log(author); // 质押的BigNumber
      console.log(event); // 当前事件的交易信息
      if (author) {
        // window.history.go(0);
        let a = author.toString();
        console.log(a);
        // let b = event.data;
        // let c = b.toString;
        // console.log(c);
      }
    });
    
    // await Web3.eth.sendSingedTransaction().on("receipt",console.log)
    // .then( (res) => {
    //   console.log(res);
    // })
    // const contract = new web3.eth.Contract(abi, address);
    // nftContract.getPastEvents("AllEvents",{
      
    // })

    // await nftContract.getPastEvents("AllEvents",{
    //   // filter,
    //   fromBlock:0,
    //   toBlock:"latest",
    // },(err,events) => {
    //   console.log(events);
    // })

    // 当特定地址接收令牌时过滤器
    // let myAddress = "0x7a3e4ACB8E428cba0800A3518666Ba2Df071E711";
    // let filter = tokenContract.filters.Pledge(null,myAddress);

    // 当过滤器发生时接收一个事件
    // tokenContract.on(filter, (from, to, amount, event) => {
    //   // to 永远是“地址”
    //   console.log(from, to, amount, event);
    // });

    // 获取签名者的地址
    // let myAddress = await signer.getAddress();
    // console.log(myAddress);
    // // 过滤来自我的所有令牌传输
    // let filterFrom = nftContract.filters.Transfer(myAddress, null);
    // // 列出最近10000个区块内发送的所有传输
    // let a = await nftContract.queryFilter(filterFrom, -10000);
    // console.log(a);

    // // 过滤所有给我的代币转账
    // let filterTo = nftContract.filters.Transfer(null, myAddress);
    // // 列出所有发送给我的转帐
    // let b = await nftContract.queryFilter(filterTo);
    // console.log(b);
  }

  // 解除质押
  async function turnbackpledge(nft) {
    console.log(nft);
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);

    const data = await nftContract.turnbackNFT(nft).then((res) => {
      console.log(res);
    });

    await tokenContract.on("TurnbackNFT", (author, acc, event) => {
      console.log(author,author.toNumber());
      console.log("Event-tokenID:",author.toString()); // 解除质押的BigNumber
      console.log("Event-addr:",acc); // 当前账户地址
      console.log(event); // 当前事件的交易信息

      if (author) {
        // window.history.go(0);
      }
    });
  }

  return (
    <div className="Pledge">
      <div className="Pledge-" style={{ padding: "0.5rem" }}>
        <div className="Pledge-Head">
          <h2>My Digital Assets</h2>
          <button onClick={goBack}>Go Back!</button>
        </div>
        <div className="Pledge-Box">
          {nfts.map((nft, i) => (
            <div key={i} className="Pledge-Box-item">
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
              <div className="Pledge-Box-item-info">
                <h3>{nft.name}</h3>
                <p>{nft.description}</p>
              </div>
              <div className="Pledge-Box-item-price">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
                <p>
                  <button onClick={pledge.bind(this, nft)}>质押</button>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="Pledge-" style={{ padding: "0.5rem" }}>
        <div className="Pledge-Head">
          <h2>My Pledged Digital Assets</h2>
        </div>
        <div className="Pledge-Box">
          {pNfts.map((nft, i) => (
            <div key={i} className="Pledge-Box-items">
              {/* <div
                className="model"
                style={{
                  width: "16rem",
                  height: "14rem",
                  borderRadius: "0.5rem 0.5rem 0 0",
                }}
              >
                <Model className="modelchild" data={nft} />
              </div> */}
              <div className="Pledge-Box-item-info">
                <h3>TokenId: {nft.toNumber()}</h3>
                <p>{nft.description}</p>
              </div>
              <div className="Pledge-Box-item-price">
                <p className="text-2xl font-bold text-white">
                  Price - {nft.price} Eth
                </p>
                <p>
                  <button onClick={turnbackpledge.bind(this, nft)}>
                    取回质押
                  </button>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <button onClick={turnbackpledge}>取回质押</button> */}
    </div>
  );
}
