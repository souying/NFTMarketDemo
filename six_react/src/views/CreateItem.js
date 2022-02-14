import { useState } from "react";
import { ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";

import "../assets/styles/CreateItem.css";

import NFT from "../contracts/NFT_ABI.json";
const nftaddress = "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";

const client = ipfsHttpClient("http://192.168.11.117:5001");

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    name: "",
    description: "",
  });

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createMarket() {
    const { name, description } = formInput;
    if (!name || !description || !fileUrl) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      alert("Upload to IPFs succeeded !!!");
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createSale(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createSale(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.mintOneToken(url);
    if (transaction) {
      await transaction.wait();
      alert("Project created successfully !!!");
      await window.location.replace("/creatorDashboard");
    }
  }

  // go back
  async function goBack() {
    await window.history.back(-1);
  }

  return (
    <div className="createItem">
      <div className="createItem-Head">
        <h2>Create Item</h2>
        <button onClick={goBack}>Go Back!</button>
      </div>
      <div className="createItem-from">
        <input
          placeholder="Asset Name"
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder="Asset Description"
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        {/* <input
          placeholder="Asset Price in Eth"
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        /> */}
        <input type="file" name="Asset" className="my-4" onChange={onChange} />
        {fileUrl && <img className="rounded mt-4" width="350" src={fileUrl} />}
        <button
          onClick={createMarket}
          className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
        >
          Create Digital Asset
        </button>
      </div>
    </div>
  );
}
