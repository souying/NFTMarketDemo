import { useState, useCallback,useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
// import { Upload, Button } from "antd";
// import { UploadOutlined } from "@ant-design/icons";
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
import "../assets/styles/CreateItem.css";
import NFT from "../contracts/NFT_ABI.json";
import { nftaddress } from '../config'

export default function CreateItem() {
  // 免费铸造(需要本地上传到IPFS)
  const [fileUrlFree, setFileUrlFree] = useState(""); // 拿到选中的文件
  const [formInputFree, updateFormInputFree] = useState({
    name: "",
    description: "",
  });
  // 付费铸造(需要本地上传到IPFS)
  const [fileUrlPaid, setFileUrlPaid] = useState(null); // 拿到选中的文件
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
  // 从本地存储取出的数据
  const [acc,setAcc] = useState("")

  useEffect(()=> {
    setAcc(JSON.parse(localStorage.acc))
  },[])

  // 让ref为uploaderd的input框变成上传文件夹
  const uploader = useCallback((node) => {
    if(node){
      node.setAttribute("webkitdirectory", "");
      node.setAttribute("directory", "");
      node.setAttribute("multiple", "");
    }

  }, []);

  // 免费模式和付费模式(onChange事件)
  async function onChange(e, type) {
    if (type == "free") {
      // 获取input上传的文件
      let file = e.target.files;
      const data = JSON.stringify({
        name: formInputFree.name,
        description:formInputFree.description,
      });
      console.log(data);
      //将文字转为上传的格式
      var blob = new Blob([data]);
      const newFile = new File([blob], "test.json");
      console.log(newFile);
      //将文字追加进数组，传入ipfs上传函数
      file = [...file, newFile];
      console.log(file);
      try {
        // 赋值
        setFileUrlFree(file);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    } else if (type == "paid") {
      // 获取input上传的文件
      let file = e.target.files;
      const data = JSON.stringify({
        name: formInputFree.name,
        description:formInputFree.description,
      });
      console.log(data);
      //将文字转为上传的格式
      var blob = new Blob([data]);
      const newFile = new File([blob], "test.json");
      console.log(newFile);
      //将文字追加进数组，传入ipfs上传函数
      file = [...file, newFile];
      console.log(file);
      try {
        // 赋值
        setFileUrlPaid(file);
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }
  }

  // 免费模式(需要本地上传到IPFS)
  async function createFreeItem() {
    // 1.发送到IPFS上
    // 定义上传的apiToken
    let apiToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5N2VEYTQ5QjQyRmVjRjI2QzBhNWM4OThmNUYzNzVGNDU1Y2U2MWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDU1ODEwMDQ4NjAsIm5hbWUiOiJkZXYyMjAyIn0.s9DZmDbB1VasuMmI50RzfFavxwIachm0XuELGz5RZY4";
    // Construct with token and endpoint
    const client = new Web3Storage({ token: apiToken });

    // Pack files into a CAR and send to web3.storage
    const rootCid = await client.put(fileUrlFree, {
      name: "test1",
      maxRetries: 3,
      wrapWithDirectory: true,
    });
    console.log(rootCid);

    try {
      alert("Upload to IPFs succeeded !!!");
      /* 2.after file is uploaded to IPFS, pass the URL to save it on Polygon */
      // 拼接从ipfs上拿到的url
      let url = `https://ipfs.io/ipfs/${rootCid}`;
      console.log(url);
      // 3.将url传入,并调用智能合约开始铸币
      createSaleFree(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  // 免费铸币过程
  async function createSaleFree(url) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    /* 4.next, create the item */
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
    // 1.发送到IPFS上
    // 定义上传的apiToken
    let apiToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5N2VEYTQ5QjQyRmVjRjI2QzBhNWM4OThmNUYzNzVGNDU1Y2U2MWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDU1ODEwMDQ4NjAsIm5hbWUiOiJkZXYyMjAyIn0.s9DZmDbB1VasuMmI50RzfFavxwIachm0XuELGz5RZY4";
    // Construct with token and endpoint
    const client = new Web3Storage({ token: apiToken });

    // Pack files into a CAR and send to web3.storage
    const rootCid = await client.put(fileUrlPaid, {
      name: "test1",
      maxRetries: 3,
      wrapWithDirectory: true,
    });
    console.log(rootCid);
    try {
      alert("Upload to IPFs succeeded !!!");
      /* 2.after file is uploaded to IPFS, pass the URL to save it on Polygon */
      // 拼接从ipfs上拿到的url
      let url = `https://ipfs.io/ipfs/${rootCid}`;
      console.log(url);
      // 3.将url传入,并调用智能合约开始铸币
      createSalePaid(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  // 付费铸币过程
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
      <div style={{margin:"1rem 0 1rem 0",backgroundColor:"pink",color:"#fff",padding:"0.5rem",borderRadius:"1rem"}}>当前账户地址: {acc}</div>
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
          {/* 上传文件夹 */}
          <input
            type="file"
            ref={uploader}
            onChange={(e) => onChange(e, "free")}
          />
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
          {/* <input
            type="file"
            name="Asset1"
            className="my-4"
            onChange={(e) => onChange(e, "paid")}
          />
          {fileUrlPaid && <img width="100" src={fileUrlPaid} />} */}
          {/* 上传文件夹 */}
          <input
            type="file"
            ref={uploader}
            onChange={(e) => onChange(e, "paid")}
          />
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
    </div>
  );
}
