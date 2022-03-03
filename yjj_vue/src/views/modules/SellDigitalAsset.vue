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
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index"
        ></Three>
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
//引入three相关文件
import three from "../../components/three.vue";
// 引入相关文件
import axios from "axios";
import { ethers } from "ethers"; //引入ethers.js
// 交易合约
import NFT from "../../abi/NFT_ABI.json"; // 引入abi
// 市场合约
import Market from "../../abi/Mkt_ABI.json"; // 引入abi

//abi接口封装函数
import abiContract from "../../assets/js/abi.js";
export default {
  name: "sell",
  // 模板引入
  components: {
    Three: three,
  },
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
      // 建立连接
      const provider = new ethers.providers.JsonRpcProvider(
        "http://192.168.11.120:8545"
      );
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      // 构建合约与abi
      let tokenContract = new ethers.Contract(
        contract.nftaddress,
        NFT.abi,
        provider
      );
      let marketContract = new ethers.Contract(
        contract.marketaddress,
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
          const meta = await axios.get(`${tokenUri}/test.json`);
          // 价格单位转换
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            itemId: i.itemId.toNumber(),
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
    // 去购买
    async buyNft(item) {
      //价格转换
      const price = ethers.utils.parseUnits(item.price.toString(), "ether");
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      //进行购买
      let transaction = await contract.marketContract.createMarketSale(
        contract.nftaddress,
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
      .sell_showBox_model {
        margin: 5px auto 0;
        width: 200px;
        height: 200px;
        border-radius: 0.5rem;
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
          margin: auto auto;
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
