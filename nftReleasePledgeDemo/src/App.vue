
<template>
  <div id="app"><router-view /></div>
</template>

<script>
// 引入相关文件
import { ethers } from "ethers"; //引入ethers.js
// import Web3Modal from "web3modal"; //引入web3modal
// NFT合约
import NFT from "../src/abi/NFT_ABI.json"; // 引入abi
const nftaddress = "0x5989415E7d0764e36EE7b0bc4b5B4cdcF87b1570";
// Market合约
// import Market from "../src/abi/Mkt_ABI.json"; // 引入abi
// const marketaddress = "0x9Aaa1475632dDEcAc3196FF3273cABC8916219fA";
//网关地址
const url = "http://192.168.11.120:8545";
const provider = new ethers.providers.JsonRpcProvider(url);
//账户私钥用于交互
const privateKey ="私钥";
//私钥签署
const wallet = new ethers.Wallet(privateKey, provider);
const address = wallet.address;
console.log("address: ", address);
//定义合约
const nftContractWithSigner = new ethers.Contract(nftaddress, NFT.abi, wallet);
console.log(nftContractWithSigner);

export default {
  name: "Home",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {};
  },
  // 方法
  methods: {
    noPledge() {
      //取回质押
      if ("WebSocket" in window) {
        //创建WebSocket连接
        console.log("您的浏览器支持WebSocket");
        // var ws = new WebSocket("ws://localhost:8080");
        var ws = new WebSocket(
          "ws://192.168.11.28:8082/auth/nft/pledge/cancel"
        );
        //申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
        ws.onopen = function () {
          //当WebSocket创建成功时，触发onopen事件
          //将消息发送到服务端
          console.log("open");
          ws.send(
            JSON.stringify({ address: address })
          );
          setInterval(() => {
            ws.send("ping");
          }, 10000);
        };

        ws.onmessage = async function (e) {
          //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
          console.log(e.data);
          let tokenId = JSON.parse(e.data);
          console.log(tokenId);
          if (tokenId.data.status == 4) {
            //判断值为4时，进行智能合约调用，取消质押
            try {
              await nftContractWithSigner
                .turnbackNFT(tokenId.data.nft_token_id)
                .then((res) => {
                  // console.log(res);
                  if (res) {
                    console.log("取消质押成功");
                    ws.send(
                      JSON.stringify({
                        address: tokenId.data.address,
                        status: 5,
                      })
                    );
                  }
                })
                .catch(() => {
                  //错误回调
                  // console.log(err);
                  console.log("取消质押失败");
                  JSON.stringify({
                    address: tokenId.data.address,
                    status: 6,
                  });
                });
            } catch (err) {
              //错误回调
              // console.log(err);
              console.log("取消质押失败");
              ws.send(
                JSON.stringify({
                  address: tokenId.data.address,
                  status: 6,
                })
              );
            }
          }
        };
        ws.onclose = function (e) {
          //当客户端收到服务端发送的关闭连接请求时，触发onclose事件
          console.log(e);
        };
        ws.onerror = function (e) {
          //如果出现连接、处理、接收、发送数据失败的时候触发onerror事件
          console.log(e);
        };
        //...
      } else {
        console.log("您的浏览器不支持WebSocket");
      }
    },
  },
  // 创建后
  created() {
    this.noPledge();
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
</style>