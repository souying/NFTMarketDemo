<template>
  <div class="create">
    <!-- 我NFT上拥有的并且未上传到Market商城的列表展示 -->
    <h1>Goods not on the shelves</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in unsoldGoods"
        :key="index"
      >
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index + 'a'"
        ></Three>
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>
            price:
            <input v-model="item.price" placeholder="price" class="elinput" />
            ETH
          </h3>
          <button @click="uploadMarket(item, price)">upload market</button>
        </div>
      </div>
    </div>
    <!-- 我上传至Market商城未出售的列表展示 -->
    <h1>Unsold goods</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in notsoldCommodity"
        :key="index"
      >
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index + 'b'"
        ></Three>
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>{{ item.price }} ETH</h3>
          <button @click="offNft(item)">Off the shelf</button>
        </div>
      </div>
    </div>
    <!-- 我上传至Market商城已经出售的列表展示 -->
    <h1>Goods sold</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in sellCommodity"
        :key="index"
      >
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index + 'c'"
        ></Three>
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>{{ item.price }} ETH</h3>
          <!-- <button>Buy</button> -->
        </div>
      </div>
    </div>
    <!-- 我上传至Market商城所有的列表展示 -->
    <h1>All goods</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in uploadGoods"
        :key="index"
      >
        <!-- <img :src="item.image" alt="" /> -->
        <Three
          class="sell_showBox_model"
          :modelName="item.modelUri"
          :ids="index + 'd'"
        ></Three>
        <h2>
          {{ item.name }}
        </h2>
        <p>{{ item.description }}</p>
        <div class="sell-showBox-one-bottom">
          <h3>{{ item.price }} ETH</h3>
          <!-- <button>Buy</button> -->
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
//abi接口封装函数
import abiContract from "../../assets/js/abi.js";
import { ethers } from "ethers"; //引入ethers.js
export default {
  name: "Home",
  // 模板引入
  components: {
    Three: three,
  },
  // 数据
  data() {
    return {
      unsoldGoods: [], //未上架商品
      sellCommodity: [], //出售商品
      uploadGoods: [], //上架的所有商品
      notsoldCommodity: [], //未出售商品
      price: "", //价格
    };
  },
  // 方法
  methods: {
    async loadNFTs() {
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      const nftdata = await contract.nftContract.fetchMyNFTs();
      //获取到所有nft
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
      console.log(nftitems);
      this.unsoldGoods = nftitems;

      //获取传到market上的所有数据
      //通过nft中的合约的tokenURI方法，获取到ifps上的数据遍历赋值
      const tokendata = await contract.marketContract.fetchItemsCreated();
      const tokenitems = await Promise.all(
        tokendata.map(async (i) => {
          const tokenUri = await contract.tokenContract.tokenURI(i.tokenId);
          //处理文字
          const meta = await axios.get(`${tokenUri}/test.json`);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            itemId: i.itemId.toNumber(),
            owner: i.owner,
            sold: i.sold,
            modelUri: tokenUri,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      /* create a filtered array of items that have been sold */
      // 通过sold筛选，false表示未出售
      const notsoldItems = tokenitems.filter((i) => !i.sold);
      // 通过sold筛选，true表示已经出售
      const sellItems = tokenitems.filter((i) => i.sold);
      // 未出售的
      this.notsoldCommodity = notsoldItems;
      // 已经出售的
      this.sellCommodity = sellItems;
      // 上架所有的记录
      this.uploadGoods = tokenitems;
    },
    async uploadMarket(item) {
      //上传到market
      if (item.price > 0) {
        // // /* then list the item for sale on the marketplace */
        //重新构建abiContract引进函数
        let contract = await new abiContract();
        // 转换价格单位
        const price = ethers.utils.parseUnits(item.price, "ether");
        let listingPrice = await contract.marketContract.getListingPrice();
        listingPrice = listingPrice.toString();
        // 拿到相关数据后传入到market合约（市场）上面
        let transaction = await contract.marketContract.createMarketItem(
          contract.nftaddress,
          item.itemId,
          price,
          {
            value: listingPrice,
          }
        );
        // 数据刷新
        await transaction.wait();
        this.loadNFTs();
        if (transaction) {
          this.$alert("上传失败", "失败", {
            dangerouslyUseHTMLString: true,
          });
        } else {
          this.$alert("上传失败", "失败", {
            dangerouslyUseHTMLString: true,
          });
        }
      } else {
        console.log("请输入正确价格");
      }
    },
    async offNft(item) {
      //下架market上的商品
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      //数据上传nft合约上
      let transaction = await contract.marketContract.recallSellingItem(
        contract.nftaddress,
        item.itemId
      );
      // 数据刷新
      await transaction.wait();
      this.loadNFTs();
      if (transaction) {
        this.$message.warning("从market市场下架成功");
        this.$router.push({
          path: "/index/SellDigitalAsset",
        });
      } else {
        this.$alert("下架失败", "失败", {
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
.create {
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
          .elinput {
            width: 6rem;
            line-height: 1.6rem;
          }
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
