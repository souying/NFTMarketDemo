<template>
  <div id="App">
    <router-view :accountId="accountId" :balanceNum="balanceNum" />
  </div>
</template>

<script>
// 引入相关文件
import Web3 from "web3";
//abi接口封装函数
import abiContract from "../src/assets/js/abi.js";

export default {
  name: "App",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      accountId: "", //账号
      balanceNum: "", //余额
    };
  },
  // 方法
  methods: {
    connect() {
      //判断账号
      // 封装了一个获取MetaMask钱包并有一系列操作的函数
      //判断用户是否安装MetaMask钱包插件
      if (typeof window.ethereum === "undefined") {
        //没安装MetaMask钱包进行弹框提示
        this.$alert("请安装MetaMask", "提示", {
          confirmButtonText: "确定",
        });
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
          .then(async (accounts) => {
            // 判断是否连接以太
            if (window.ethereum.networkVersion !== "84351") {
              this.$alert("请连接到对应的以太网", "提示", {
                confirmButtonText: "确定",
              });
            } else {
              let web3 = new Web3(window.web3.currentProvider);
              //如果用户同意了登录请求，你就可以拿到用户的账号
              //这里返回用户钱包地址
              this.accountId = accounts.join();
              var accountId = this.accountId;
              // console.log(this.accountId);
              // 查看当前账户的余额并渲染到对应input中(这里获取的余额是钱包中的ETH)
              // 读取address中的余额，余额单位是wei
              await web3.eth.getBalance(this.accountId, (err, wei) => {
                // 余额单位从wei转换为ether
                this.balanceNum = web3.utils.fromWei(wei, "ether");
                // var balanceNum = this.balanceNum;
                // console.log(this.balanceNum);
              });
              //建立websocket链接
              if ("WebSocket" in window) {
                console.log("您的浏览器支持WebSocket");
                //创建WebSocket连接
                var ws = new WebSocket(
                  "ws://192.168.11.28:8082/auth/nft/pledge"
                );
                //申请一个WebSocket对象，参数是服务端地址，同http协议使用http://开头一样，WebSocket协议的url使用ws://开头，另外安全的WebSocket协议使用wss://开头
                ws.onopen = function () {
                  //当WebSocket创建成功时，触发onopen事件
                  //将消息发送到服务端
                  console.log("open");
                  ws.send(JSON.stringify({ address: accountId }));
                  setInterval(() => {
                    ws.send("ping");
                  }, 1000000);
                };

                ws.onmessage = async function (e) {
                  //当客户端收到服务端发来的消息时，触发onmessage事件，参数e.data包含server传递过来的数据
                  // console.log(e.data);
                  let tokenData = JSON.parse(e.data);
                  // console.log(tokenId);
                  //重新构建abiContract引进函数
                  let contract = await new abiContract();
                  if (tokenData.data.status == 1) {
                    await contract.nftContract
                      .pledgeNFT(tokenData.data.nft_token_id)
                      .then((res) => {
                        if (res) {
                          console.log(res);
                          ws.send(
                            JSON.stringify({
                              address: accountId,
                              status: 2,
                            })
                          );
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        ws.send(
                          JSON.stringify({ address: accountId, status: 3 })
                        );
                      });
                  } else if (tokenData.data.status == 4) {
                    await contract.nftContract
                      .turnbackNFT(tokenData.data.nft_token_id)
                      .then((res) => {
                        console.log(res);
                        if (res) {
                          console.log(12345);
                          ws.send(
                            JSON.stringify({
                              address: accountId,
                              status: 5,
                            })
                          );
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                        ws.send(
                          JSON.stringify({ address: accountId, status: 6 })
                        );
                      });
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
            }
          });
      }
    },
  },
  // 创建后
  created() {
    this.connect();
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
#App {
  width: 100%;
  height: 100%;
}
</style>