import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import "./assets/css/reset.css";
import NFT from "./contracts/NFT_ABI.json";

const nftaddress = "0x5989415E7d0764e36EE7b0bc4b5B4cdcF87b1570";

//判断用户是否安装MetaMask钱包插件
if (typeof window.ethereum === "undefined") {
  //没安装MetaMask钱包进行弹框提示
  // alert("请先安装MetaMask");
  alert("Please install metamask first!");
} else {
  //如果用户安装了MetaMask，你可以要求他们授权应用登录并获取其账号
  window.ethereum
    .enable()
    .catch(function (reason) {
      //如果用户拒绝了登录请求
      if (reason === "User rejected provider access") {
        // 用户拒绝登录后执行语句；
      } else {
        // 本不该执行到这里，但是真到这里了，说明发生了意外
        alert("There was a problem signing you in");
      }
    })
    .then((accounts) => {
      // 判断是否连接以太
      if (window.ethereum.networkVersion !== "84351") {
        // alert("请连接到对应的以太网");
        alert("Please connect to the corresponding Ethernet!");
      } else {
        // 取到当前账户地址(坑:与钱包上的账户地址有区别，此处把字母全转化为小写了)
        let account = accounts.join();
        // 存本地
        localStorage.acc = JSON.stringify(account);

        // WebSocket(长链接)
        if ("WebSocket" in window) {
          console.log("您的浏览器支持WebSocket");
          var ws = new WebSocket("ws://192.168.11.28:8082/auth/nft/pledge"); //创建WebSocket连接
          //申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
          ws.onopen = function () {
            //当WebSocket创建成功时，触发onopen事件
            console.log("open");
            let json = {
              address: `${account}`,
            };
            ws.send(JSON.stringify(json)); //将消息发送到服务端(后台需要的信息)

            // 使用定时器发送请求保持长链接
            setInterval(() => {
              ws.send("ping");
            }, 10000);
          };
          ws.onmessage = async function (e) {
            //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
            console.log(e.data);
            let data = JSON.parse(e.data);
            console.log(data);
            if (data.data.status == 1) {
              const web3Modal = new Web3Modal({
                network: "mainnet",
                cacheProvider: true,
              });
              const connection = await web3Modal.connect();
              const provider = new ethers.providers.Web3Provider(connection);
              const signer = provider.getSigner();

              const tokenContract = new ethers.Contract(
                nftaddress,
                NFT.abi,
                provider
              );
              const nftContract = new ethers.Contract(
                nftaddress,
                NFT.abi,
                signer
              );
              try {
                // 质押
                const datas = await nftContract.pledgeNFT(
                  data.data.nft_token_id
                );
                // await data.wait();
                console.log(datas);
                // 质押的event
                await tokenContract.on("Pledge", (author, event) => {
                  console.log(author); // 质押的BigNumber
                  console.log(event); // 当前事件的交易信息
                  // 当拿到author时，代表质押成功
                  if (author) {
                    let json = {
                      address: `${account}`,
                      status: 2,
                    };
                    ws.send(JSON.stringify(json)); //将消息发送到服务端(质押成功)
                  }
                });
              } catch (error) {
                let json = {
                  address: `${account}`,
                  status: 3,
                };
                ws.send(JSON.stringify(json)); //将消息发送到服务端(质押失败)
                alert("未授权，质押失败!!!");
              }
            } else if (data.data.status == 4) {
              // 解除质押在其他网站做
              const web3Modal = new Web3Modal({
                network: "mainnet",
                cacheProvider: true,
              });
              const connection = await web3Modal.connect();
              const provider = new ethers.providers.Web3Provider(connection);
              const signer = provider.getSigner();

              const tokenContract = new ethers.Contract(
                nftaddress,
                NFT.abi,
                provider
              );
              const nftContract = new ethers.Contract(
                nftaddress,
                NFT.abi,
                signer
              );

              const datass = await nftContract.turnbackNFT(
                data.data.nft_token_id
              );
              console.log(datass);
              // 解除质押的event
              await tokenContract.on("TurnbackNFT", (author, acc, event) => {
                console.log(author); // 解除质押的BigNumber
                console.log(acc); // 当前账户地址
                console.log(event); // 当前事件的交易信息
                // 当拿到author时，代表解除质押成功
                if (author) {
                  let json = {
                    address: `${account}`,
                    status: 5,
                  };
                  ws.send(JSON.stringify(json)); //将消息发送到服务端(取回质押成功)
                }
              });
            }
          };
          ws.onclose = function (e) {
            //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
            console.log("close");
          };
          ws.onerror = function (error) {
            //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
            console.log(error);
          };
        } else {
          console.log("您的浏览器不支持WebSocket");
        }
      }
    });
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
