<template>
  <div class="create">
    <!-- 我NFT上拥有的并且未上传到Market商城的列表展示 -->
    <h1>Unsold goods</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in unsoldGoods"
        :key="index"
      >
        <img :src="item.image" alt="" />
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
    <!-- 我上传至Market商城已经出售的列表展示 -->
    <h1>The goods I sell</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in sellCommodity"
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
    <!-- 我上传至Market商城所有的列表展示 -->
    <h1>My products on the shelves</h1>
    <div class="sell-showBox">
      <div
        class="sell-showBox-one"
        v-for="(item, index) in uploadGoods"
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
  name: "Home",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      unsoldGoods: [], //未上架商品
      sellCommodity: [], //出售商品
      uploadGoods: [], //上架商品
      price: "", //价格
    };
  },
  // 方法
  methods: {
    async loadNFTs() {
      //连接账户
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      //获取传到nft上的所有数据
      const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer);
      const nftdata = await nftContract.fetchMyNFTs();
      //通过axios获取到ipfs上的数据遍历数据，处理数据
      const nftitems = await Promise.all(
        nftdata.map(async (i) => {
          const meta = await axios.get(i.uri);
          let item = {
            itemId: i.itemId.toNumber(),
            owner: i.owner,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      this.unsoldGoods = nftitems;
      //获取传到market上的所有数据
      const marketContract = new ethers.Contract(
        nftmarketaddress,
        Market.abi,
        signer
      );
      //通过nft中的合约的tokenURI方法，获取到ifps上的数据遍历赋值
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const tokendata = await marketContract.fetchItemsCreated();
      const tokenitems = await Promise.all(
        tokendata.map(async (i) => {
          const tokenUri = await tokenContract.tokenURI(i.tokenId);
          const meta = await axios.get(tokenUri);
          let price = ethers.utils.formatUnits(i.price.toString(), "ether");
          let item = {
            price,
            tokenId: i.tokenId.toNumber(),
            seller: i.seller,
            owner: i.owner,
            sold: i.sold,
            image: meta.data.image,
            name: meta.data.name,
            description: meta.data.description,
          };
          return item;
        })
      );
      /* create a filtered array of items that have been sold */
      // 通过sold筛选，true表示已经出售
      const soldItems = tokenitems.filter((i) => i.sold);
      // console.log(soldItems);
      // console.log(tokenitems);
      //我上传到ntf上所有的
      this.uploadGoods = tokenitems;
      //我已经出售的
      this.sellCommodity = soldItems;
    },
    //上传到market
    async uploadMarket(item) {
      if (item.price > 0) {
        // 建立连接
        const web3Modal = new Web3Modal({
          network: "mainnet",
          cacheProvider: true,
        });
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        // /* then list the item for sale on the marketplace */
        // 拿到相关数据后传入到market合约（市场）上面
        let contract = new ethers.Contract(
          nftmarketaddress,
          Market.abi,
          signer
        );
        // 转换价格单位
        const price = ethers.utils.parseUnits(item.price, "ether");
        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();
        //数据上传market合约上
        let transaction = await contract.createMarketItem(
          nftaddress,
          item.itemId,
          price,
          { value: listingPrice }
        );
        // console.log(transaction);
        // 数据刷新
        await transaction.wait();
        if (transaction) {
          this.$message.warning("上传market市场成功");
          this.$router.push({
            path: "/index/SellDigitalAsset",
          });
        }
      } else {
        console.log("请输入正确价格");
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
          .elinput {
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
