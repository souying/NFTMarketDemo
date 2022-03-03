<template>
  <div id="MyDigitalAssets">
    <!-- 我拥有的商品列表展示 -->
    <h1>My Digital Assets</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in commodity"
        :key="index"
      >
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index"
        ></Three>
        <!-- <img :src="item.image" alt="" /> -->
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
//引入three相关文件
import three from "../../components/three.vue";
// 引入相关文件
import axios from "axios";
import { ethers } from "ethers"; //引入ethers.js
//abi接口封装函数
import abiContract from "../../assets/js/abi.js";

export default {
  name: "MyDigitalAssets",
  // 模板引入
  components: {
    Three: three,
  },
  // 数据
  data() {
    return {
      commodity: [], //所有商品
    };
  },
  // 方法
  methods: {
    async loadNFTs() {
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      //获取数据
      const data = await contract.marketContract.fetchMyNFTs();
      const items = await Promise.all(
        data.map(async (i) => {
          const tokenUri = await contract.tokenContract.tokenURI(i.tokenId);
          // console.log(tokenUri);
          //处理文字
          const meta = await axios.get(`${tokenUri}/test.json`);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            itemId: i.tokenId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            modelUri: tokenUri,
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
#MyDigitalAssets {
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
      .sell_showBox_model {
        margin: 5px auto 0;
        width: 200px;
        height: 200px;
        border-radius: 0.5rem;
      }
      // img {
      //   width: 16rem;
      //   height: 17rem;
      //   border-radius: 0.5rem 0.5rem 0 0;
      // }
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
