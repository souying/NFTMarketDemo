<template>
  <div class="sell">
    <!-- 商城商品列表展示 -->
    <h1>Sell Digital Asset</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in commodity"
        :key="index"
      >
        <img :src="item.image" alt="" />
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>{{ item.price }} ETH</h3>
          <button @click="buyNft(item)">Buy</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 引入相关文件
import axios from "axios";
import { ethers } from "ethers"; //引入ethers.js
import Web3Modal from "web3modal"; //引入web3modal
// console.log(ethers);
// 交易合约
import NFT from "../../abi/NFT01_ABI.json"; // 引入abi
const nftaddress = "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";
// 市场合约
import Market from "../../abi/Mkt_ABI.json"; // 引入abi
const nftmarketaddress = "0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921";

// console.log("tokenContract:", tokenContract);
// console.log("marketContract:", marketContract);
export default {
  name: "sell",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      commodity: [], //上架商品信息
    };
  },
  // 方法
  methods: {
    //调用合约查询数据
    async callContract() {
      // 网关地址
      // const url = "http://192.168.11.120:8545";
      //创立连接
      // const provider = new ethers.providers.JsonRpcProvider(url);
      const provider = new ethers.providers.JsonRpcProvider(
        "http://192.168.11.120:8545"
      );
      // 构建合约与abi
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        provider
      );
      // 获取传到market商城上的所有数据
      const data = await marketContract.fetchMarketItems();
      // 通过nft中的合约的tokenURI方法，获取到ifps上的数据遍历赋值
      const items = await Promise.all(
        data.map(async (i) => {
          //获取tokenid循环查询所有
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          // console.log("tokenUri",tokenUri);
          //注意，不是axios跨域问题，是地址拼接问题
          let meat1 = tokenUri.replace(/"/gi, "");
          const meta = await axios.get(meat1);
          // 价格单位转换
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            itemId: i.itemId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      // console.log(items);
      this.commodity = items;
    },
    // 去购买
    async buyNft(item) {
      // console.log(item);
      const web3Modal = new Web3Modal();
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
       //价格转换
      const price = ethers.utils.parseUnits(item.price.toString(), "ether");
      // 使用nft合约进行购买
      const contract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      // console.log(nftaddress, item.itemId, price);
      const transaction = await contract.createMarketSale(
        nftaddress,
        item.itemId,
        {
          value: price,
        }
      );
      // 数据刷新
      await transaction.wait();
      this.callContract();
      if (transaction) {
        this.$message.warning("购买成功");
        this.$router.push({
          path: "/index/MyDigitalAssets",
        });
      } else {
        this.$alert("购买失败", "失败", {
          dangerouslyUseHTMLString: true,
        });
      }
    },
  },
  // 创建后
  created() {
    this.callContract();
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
.sell {
  // 关于页展示数据盒子
  .sell-showBox {
    margin: auto;
    margin-top: 2rem;
    width: 100%;
    height: 100%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    padding: 1rem;
    box-sizing: border-box;
    display: flex;
    float: left;
    flex-wrap: wrap;
    margin-bottom: 10rem;
    .sell-showBox-one {
      width: 16rem;
      height: 28rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
      border-radius: 0.5rem;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      margin: 1rem;
      img {
        width: 16rem;
        height: 17rem;
        border-radius: 0.5rem 0.5rem 0 0;
      }
      h2 {
        text-align: left;
        margin: 1rem 0 1.5rem 1rem;
      }
      p {
        text-align: left;
        margin: 0 0 1rem 1rem;
        line-height: 1rem;
        height: 2rem;
      }
      .sell-showBox-one-bottom {
        background-color: #000;
        color: #fff;
        border-radius: 0 0 0.5rem 0.5rem;
        flex: 1;
        h3 {
          text-align: left;
          padding: 0.7rem;
          font-size: 16px;
        }
        button {
          width: 100%;
          height: 1.5rem;
          background-color: #ea4c98;
          border: 0;
          color: #fff;
          border-radius: 0.2rem;
        }
      }
    }
  }
}
</style>
