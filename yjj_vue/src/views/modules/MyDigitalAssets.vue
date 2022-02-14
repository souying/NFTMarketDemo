<template>
  <div class="my">
    <!-- 我拥有的商品列表展示 -->
    <h1>My Digital Assets</h1>
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
          <!-- <button @click="buyNft(item)">Buy</button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 引入相关文件
// 引入相关文件
import axios from "axios";
import { ethers } from "ethers"; //引入ethers.js
import Web3Modal from "web3modal"; //引入web3modal
// NFT合约
import NFT from "../../abi/NFT01_ABI.json"; // 引入abi
const nftaddress = "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";
// Market合约
import Market from "../../abi/Mkt_ABI.json"; // 引入abi
const nftmarketaddress = "0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921";

export default {
  name: "my",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      commodity: [], //所有商品
    };
  },
  // 方法
  methods: {
    async loadNFTs() {
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      //通过market合约，查看我购买的所有商品
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const data = await marketContract.fetchMyNFTs();
      const items = await Promise.all(
        data.map(async (i) => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          let meat1 = tokenUri.replace(/"/gi, "");
          const meta = await axios.get(meat1);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
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
  },
  // 创建后
  created() {
    this.loadNFTs();
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
.my {
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
