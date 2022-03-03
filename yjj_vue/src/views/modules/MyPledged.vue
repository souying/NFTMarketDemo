<template>
  <div id="MyPledged">
    <!-- 我拥有的商品列表展示 -->
    <h1>My Pledged Digital Assets</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in ownItems"
        :key="index"
      >
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index + 'a'"
        ></Three>
        <!-- <img :src="item.image" alt="" /> -->
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>{{ item.price }} ETH</h3>
          <button @click="pledgeNft(item)">Pledge</button>
        </div>
      </div>
    </div>
    <!--  -->
    <!-- 我拥有的商品列表展示 -->
    <h1>Goods sold</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in pledgeItems"
        :key="index"
      >
        <!-- <img :src="item.image" alt="" /> -->
        <!-- <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index + 'b'"
        ></Three> -->
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>{{ item.price }} ETH</h3>
          <button @click="takeNft(item)">Buy</button>
        </div>
      </div>
    </div>
    <!--  -->
  </div>
</template>

<script>
//引入three相关文件
import three from "../../components/three.vue";
// 引入相关文件
import axios from "axios";
//abi接口封装函数
import abiContract from "../../assets/js/abi.js";
export default {
  name: "MyPledged",
  // 模板引入
  components: {
    Three: three,
  },
  // 数据
  data() {
    return {
      ownItems: [], //所有自己的nft
      pledgeItems: [], //质押的nft
    };
  },
  // 方法
  methods: {
    async loadNFTs() {
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      const nftdata = await contract.nftContract.fetchMyNFTs();
      //通过axios获取到ipfs上的数据遍历数据，处理数据
      const nftitems = await Promise.all(
        nftdata.map(async (i) => {
          //处理文字
          const meta = await axios.get(`${i.uri}/test.json`);
          let item = {
            itemId: i.itemId.toNumber(),
            tokenId: i.tokenId.toNumber(),
            owner: i.owner,
            modelUri: i.uri,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      this.ownItems = nftitems;
      //fetchPledgeNFTs,fetchMyPledgeNFTs
      const nftPledgedata = await contract.nftContract.fetchMyPledgeNFTs();
      // console.log(nftPledgedata);
      const nftPledgeitems = await Promise.all(
        nftPledgedata.map(async (i) => {
          //处理文字
          // const meta = await axios.get(`${i.uri}/test.json`);
          let item = {
            tokenId: i.toNumber(),
            // itemId: i.tokenId.toNumber(),
            // owner: i.owner,
            // modelUri: tokenUri,
            // name: meta.data.name,
            // description: meta.data.description,
          };
          return item;
        })
      );
      this.pledgeItems = nftPledgeitems;
      // console.log(nftPledgeitems);
    },
    // //质押
    async pledgeNft(item) {
      // console.log(item);
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      let transaction = await contract.nftContract.pledgeNFT(item.tokenId);
      // 数据刷新
      await transaction.wait();
      this.loadNFTs();
      if (transaction) {
        this.$message.warning("质押成功");
      } else {
        this.$alert("质押失败", "失败", {
          dangerouslyUseHTMLString: true,
        });
      }
    },
    // 取回质押
    async takeNft(item) {
      // console.log(item);
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      let transaction = await contract.nftContract.turnbackNFT(item.tokenId);
      // 数据刷新
      await transaction.wait();
      this.loadNFTs();
      if (transaction) {
        this.$message.warning("取回质押成功");
      } else {
        this.$alert("取回质押失败", "失败", {
          dangerouslyUseHTMLString: true,
        });
      }
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
#MyPledged {
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
