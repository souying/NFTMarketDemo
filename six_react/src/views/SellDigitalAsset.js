import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
import Web3Modal from "web3modal";
import "../assets/styles/SellDigitalAsset.css";
import Model from "./Model";

import NFT from "../contracts/NFT_ABI.json";
import Market from "../contracts/Mkt_ABI.json";

import {nftaddress, nftmarketaddress } from '../config'

// let rpcEndpoint = "https://bsc-dataseed1.binance.org/";
// let rpcEndpoint =
//   "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
let rpcEndpoint = "http://192.168.11.120:8545/";

// if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
//   rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
// }

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
    console.log(data);
    const items = await Promise.all(
      data.map(async (i) => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId);
        console.log(tokenUri);
        let mtl = `${tokenUri}/1.mtl`;
        let obj = `${tokenUri}/1.obj`;
        let txt = `${tokenUri}/Introduction.txt`;
        // let _tokenUri = tokenUri.replace(/"/gi, "");
        const meta = await axios.get(`${tokenUri}/test.json`);
        console.log(meta);
        let price = ethers.utils.formatUnits(i.price.toString(), "ether");

        let item = {
          price,
          itemId: i.itemId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          addr: tokenUri,
          mtl,
          obj,
          txt,
          // image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };

        // 转换cost为ether单位的BigNumber类型
        const costBigNumber = ethers.utils.parseEther(`${item.itemId}`);
        console.log(costBigNumber);
        // 转换cost为 wei单位的BigNumber类型
        // const costWei = ethers.utils.bigNumberify(21000).mul(`${item.itemId}`)
        // console.log(costWei);
        return item;
      })
    );
    setNfts(items);
    console.log(items);
    setLoadingState("loaded");

    // 测试
    // await tokenContract.symbol().then((res) => {
    //   console.log(res);
    // });
    // console.log(111);
    // // await marketContract.getListingPrice().then(res => {
    // //   console.log(res);
    // // });
    // await tokenContract
    //   .fetchAddressNFTs("0xE9f6d5F43b6D61d6cC146aafCB3E5Af3C8f774E5")
    //   .then((res) => {
    //     console.log(res);
    //   });
  }
  // buyBtn
  async function buyNft(nft) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer);

    const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
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
              {/* <img src={nft.image} /> */}
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
              <div className="SellDigitalAsset-Box-content-item-info">
                <p className="SellDigitalAsset-Box-content-item-info-name">
                  {nft.name}
                </p>
                <div style={{ height: "3rem", overflow: "hidden" }}>
                  <p
                    style={{
                      paddingLeft: "1rem",
                      fontSize: "14px",
                      paddingTop: "0.5rem",
                    }}
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
                    paddingTop: "1rem",
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
