import { useState } from "react";
import { ethers } from "ethers";
// import { create as ipfsHttpClient } from "ipfs-http-client";
import Web3Modal from "web3modal";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";

import "../assets/styles/CreateItem.css";

import NFT from "../contracts/NFT_ABI.json";
// const nftaddress = "0x6B2678C1eE536C01bfDceEf798a1dBf19B56103F";

const nftaddress = "0xb629e273786f9db3d578c41c927c4ef216400057"; // 测试网

// const client = ipfsHttpClient("http://192.168.11.156:5001"); // 王磊的
// const client = ipfsHttpClient("http://192.168.11.117:5001"); // 王梓逻的

export default function CreateItem() {
  // 免费铸造(需要本地上传到IPFS)
  const [fileUrlFree, setFileUrlFree] = useState(null);
  const [formInputFree, updateFormInputFree] = useState({
    name: "",
    description: "",
  });
  // 付费铸造(需要本地上传到IPFS)
  const [fileUrlPaid, setFileUrlPaid] = useState(null);
  const [formInputPaid, updateFormInputPaid] = useState({
    name: "",
    description: "",
  });
  // 免费铸造(已经上传到IPFS)
  const [fileUrlFreeFixed, setFileUrlFreeFixed] = useState(null);
  const [formInputFreeFixed, updateFormInputFreeFixed] = useState({
    address: "",
  });
  // 付费铸造(已经上传到IPFS)
  const [fileUrlPaidFixed, setFileUrlPaidFixed] = useState(null);
  const [formInputPaidFixed, updateFormInputPaidFixed] = useState({
    address: "",
  });
  // 返回结果
  // const [res, setRes] = useState("");

  // 封装请求上传到ipfs上
  function request(parameter,set) {
    console.log(parameter);
    var myHeaders = new Headers();
    myHeaders.append("accept", "application/json");
    myHeaders.append(
      "Authorization",
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5N2VEYTQ5QjQyRmVjRjI2QzBhNWM4OThmNUYzNzVGNDU1Y2U2MWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDU1ODEwMDQ4NjAsIm5hbWUiOiJkZXYyMjAyIn0.s9DZmDbB1VasuMmI50RzfFavxwIachm0XuELGz5RZY4"
    );

    var formdata = new FormData();
    formdata.append("file", parameter);

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch("https://api.web3.storage/upload", requestOptions)
      .then((response) => response.text())
      .then((result) => {
        console.log(result);
        // 处理数据
        // let json = JSON.parse(result);
        // let val = json.cid
        // console.log(val);
        // let url = `https://ipfs.io/ipfs/${val}`;
        // // 赋值
        // set(url);
        //  var returnData = result;
        //  return returnData;
      })
      .catch((error) => console.log("error", error));
  }
  // 免费模式和付费模式(onChange事件)
  async function onChange(e, type) {
    if (type == "free") {
      // 获取input上传的文件
      const file = e.target.files[0];
      console.log(file);
      try {
        // await request(file,setFileUrlFree);
        // console.log(res);
        // if (res != "") {
        //   console.log(111);
        //   console.log(res);
        // }

        // const added = await client.add(file, {
        //   progress: (prog) => console.log(`received: ${prog}`),
        // });
        // 获取上传文件hash值，'https://ipfs.io/ipfs/'+hashCode 即为上传后的文件地址
        // const url = `https://ipfs.io/ipfs/${added.path}`;
        // const url = `http://192.168.11.117:8081/ipfs/${added.path}`; // 王梓逻的
        // setFileUrlFree(url);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else if (type == "paid") {
      // 获取input上传的文件
      const file = e.target.files[0];
      try {
        await request(file, setFileUrlPaid);
        // const added = await client.add(file, {
        //   progress: (prog) => console.log(`received: ${prog}`),
        // });
        // 获取上传文件hash值，'https://ipfs.io/ipfs/'+hashCode 即为上传后的文件地址
        // const url = `https://ipfs.io/ipfs/${added.path}`;
        // const url = `http://192.168.11.117:8081/ipfs/${added.path}`; // 王梓逻的
        // setFileUrlPaid(url);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else if (type == "all") {
      const file = e.target.files[0];
      try {
        console.log(file);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }
  }

  // 免费模式(需要本地上传到IPFS)
  async function createFreeItem() {
    const { name, description } = formInputFree;
    if (!name || !description || !fileUrlFree) return;
    /* first, upload to IPFS */
    console.log(fileUrlFree);
    const data = JSON.stringify({
      name,
      description,
      image: fileUrlFree,
    });
    try {
      await request(data);
      // const added = await client.add(data);
      // const url = `http://192.168.11.156:8080/ipfs/${added.path}`; // 王磊的
      // const url = `http://192.168.11.117:8081/ipfs/${added.path}`; // 王梓逻的
      alert("Upload to IPFs succeeded !!!");
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      // createSaleFree(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createSaleFree(url) {
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

  // 付费模式(需要本地上传到IPFS)
  async function createPaidItem() {
    const { name, description } = formInputPaid;
    if (!name || !description || !fileUrlPaid) return;
    /* first, upload to IPFS */
    const data = JSON.stringify({
      name,
      description,
      image: fileUrlPaid,
    });
    try {
      await request(data, createSalePaid);
      // const added = await client.add(data);
      // const url = `http://192.168.11.156:8080/ipfs/${added.path}`; // 王磊的
      // const url = `http://192.168.11.117:8081/ipfs/${added.path}`; // 王梓逻的
      alert("Upload to IPFs succeeded !!!");
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      // createSalePaid(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createSalePaid(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let price = await contract.pricePerCZTT();
    let transaction = await contract.mintOneTokenReqPay(url, { value: price });
    if (transaction) {
      await transaction.wait();
      alert("Project created successfully !!!");
      await window.location.replace("/creatorDashboard");
    }
  }

  // 免费模式(已经上传到IPFS)
  async function changeFree(e) {
    try {
      setFileUrlFreeFixed(e.target.value);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createdFreeItem() {
    if (!fileUrlFreeFixed) return;
    try {
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createdSaleFree(formInputFreeFixed.address);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createdSaleFree(url) {
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

  // 付费模式(已经上传到IPFS)
  async function changePaid(e) {
    try {
      setFileUrlPaidFixed(e.target.value);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createdPaidItem() {
    if (!fileUrlPaidFixed) return;
    try {
      /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
      createdSalePaid(formInputPaidFixed.address);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  async function createdSalePaid(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* next, create the item */
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let priced = await contract.pricePerCZTT();
    let transaction = await contract.mintOneTokenReqPay(url, { value: priced });
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
  // 批量上传
  // const addedd = await client.addAll(file, {
  //   progress: (prog) => console.log(`received: ${prog}`),
  // });

  return (
    <div className="createItem">
      <div className="createItem-Head">
        <h2>Create Item</h2>
        <button onClick={goBack}>Go Back!</button>
      </div>
      <div className="createItem-from">
        {/* 免费铸造NFT模式(需要本地上传到IPFS) */}
        <div className="createItem-from-box">
          <h3>Free casting</h3>
          <input
            style={{ textIndent: "0.6rem" }}
            placeholder="Asset Name"
            onChange={(e) =>
              updateFormInputFree({ ...formInputFree, name: e.target.value })
            }
          />
          <textarea
            style={{ textIndent: "0.6rem" }}
            placeholder="Asset Description"
            onChange={(e) =>
              updateFormInputFree({
                ...formInputFree,
                description: e.target.value,
              })
            }
          />
          <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={(e) => onChange(e, "free")}
          />
          {fileUrlFree && <img width="100" src={fileUrlFree} />}
          <button onClick={createFreeItem} className="createItem-from-btn">
            Create Free Digital Asset
          </button>
        </div>
        {/* 付费铸造NFT模式(需要本地上传到IPFS) */}
        <div className="createItem-from-box">
          <h3>Paid casting</h3>
          <input
            style={{ textIndent: "0.6rem" }}
            placeholder="Asset Name"
            onChange={(e) =>
              updateFormInputPaid({ ...formInputPaid, name: e.target.value })
            }
          />
          <textarea
            style={{ textIndent: "0.6rem" }}
            placeholder="Asset Description"
            onChange={(e) =>
              updateFormInputPaid({
                ...formInputPaid,
                description: e.target.value,
              })
            }
          />
          <input
            type="file"
            name="Asset1"
            className="my-4"
            onChange={(e) => onChange(e, "paid")}
          />
          {fileUrlPaid && <img width="100" src={fileUrlPaid} />}
          <button onClick={createPaidItem} className="createItem-from-btn">
            Create Paid Digital Asset
          </button>
        </div>
        {/* 免费铸造NFT模式(已经上传到IPFS) */}
        <div className="createItem-from-box">
          <h3>Free casting(Not Upload IPFs )</h3>
          <input
            type="text"
            name="Asset"
            style={{ textIndent: "0.6rem" }}
            className="my-4"
            onChange={changeFree}
            placeholder="Asset address"
          />
          <button onClick={createdFreeItem} className="createItem-from-btn">
            Created Free Digital Asset
          </button>
        </div>
        {/* 付费铸造NFT模式(已经上传到IPFS) */}
        <div className="createItem-from-box">
          <h3>Paid casting(Not Upload IPFs )</h3>
          <input
            type="text"
            name="Asset"
            style={{ textIndent: "0.6rem" }}
            className="my-4"
            onChange={changePaid}
            placeholder="Asset address"
          />
          <button onClick={createdPaidItem} className="createItem-from-btn">
            Create Paid Digital Asset
          </button>
        </div>
      </div>
      <Upload
        // action="http://192.168.11.117:5001/"
        // action="http://192.168.11.117:8081"
        directory
      >
        <Button onChange={(e) => onChange(e, "all")} icon={<UploadOutlined />}>
          Upload Directory
        </Button>
      </Upload>
    </div>
  );
}
