<template>
  <div class="createItem">
    <el-form ref="form" :model="form" label-width="9rem">
      <el-form-item label="Asset Name">
        <el-input v-model="form.name" placeholder="Asset Name"></el-input>
      </el-form-item>
      <el-form-item label="Asset Description">
        <el-input
          type="textarea"
          v-model="form.desc"
          placeholder="Asset Description"
        ></el-input>
      </el-form-item>
      <!-- <el-form-item label="Asset Price in Eth">
        <el-input
          v-model="form.price"
          placeholder="Asset Price in Eth"
        ></el-input>
      </el-form-item> -->
    </el-form>
    <div class="createItem-Btn">
      <el-upload
        class="img-upload"
        action="tmp"
        :auto-upload="false"
        :limit="1"
        :on-change="handleChange"
        :on-exceed="handleExceed"
      >
        <el-button slot="trigger" size="medium" type="primary"
          >Select Picture</el-button
        >
        <el-button
          style="margin-left: 10px"
          size="medium"
          type="success"
          @click="onSubmit"
          >Create Digital Asset</el-button
        >
      </el-upload>
    </div>
  </div>
</template>

<script>
// 矿机：http://192.168.11.120:8545/
// Czt01NFT：
// 0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29
// CztMarket：
// 0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921
// 引入相关文件
import { ethers } from "ethers"; //引入ethers.js
import Web3Modal from "web3modal"; //引入Web3Modal
// console.log(Web3Modal);
// // console.log(ethers);
// // NFT合约
import NFT from "../../abi/NFT01_ABI.json"; // 引入abi
const nftaddress = "0x90fe47327d2e2851fD4eFEd32bc64c4b14CB1D29";
// // Market合约
// import Market from "../../abi/Mkt_ABI.json"; // 引入abi
// const nftmarketaddress = "0xFC2Ea5A1F3Bed1B545A6be182BF52C20B5e45921";
// // console.log(NFT);
// // console.log(Market);
import { create } from "ipfs-http-client";
export default {
  name: "CreateItem",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      fileList: [], //图片
      form: {
        name: "", //名字
        desc: "", //描述
        price: "", //价格
      },
    };
  },
  // 方法
  methods: {
    //文件上传状态改变时的钩子
    handleChange(files, fileList) {
      this.fileList = fileList;
    },
    //文件超出个数限制时的钩子
    handleExceed(files, fileList) {
      this.$message.warning(
        `当前限制选择 1 个文件，本次选择了 ${files.length} 个文件，共选择了 ${
          files.length + fileList.length
        } 个文件`
      );
    },
    //点击上传按钮
    onSubmit() {
      // || !this.form.price
      if (this.fileList.length < 1 || !this.form.name || !this.form.desc) {
        //所有内容必须不为空
        this.$message.warning("请选择需要上传的文件");
      } else {
        const reader = new window.FileReader();
        // console.log(this.fileList[0].raw);
        reader.readAsArrayBuffer(this.fileList[0].raw);
        reader.onloadend = () => {
          let buffer = Buffer(reader.result);
          this.uploadToIPFS(buffer);
        };
      }
    },
    async uploadToIPFS(buffer) {
      //连接ipfs
      const ipfs = create("http://192.168.11.117:5001");
      //将图片上传到ipfs
      let result = await ipfs.add(buffer);
      // 获取到图片的地址
      this.src = `https://ipfs.io/ipfs/${result.path}`;
      let fileUrl = this.src;
      // 将图片地址和图片描述内容转为字符串
      const data = JSON.stringify({
        name: this.form.name,
        description: this.form.desc,
        image: fileUrl,
      });
      try {
        //将描述内容与图片地址再次上传
        let added = await ipfs.add(data);
        const url = `https://ipfs.io/ipfs/${added.path}`;
        this.$message.warning("上传至ipfs成功");
        // 上传成功后获取参数，上传到nft合约上面。

        this.createSale(url);
      } catch (error) {
        this.$alert("失败", "失败", {
          dangerouslyUseHTMLString: true,
        });
        console.log("Error uploading file: ", error);
      }
    },
    async createSale(url) {
      // console.log(url);
      // 连接钱包，获取签名
      const web3Modal = new Web3Modal({
        network: "mainnet",
        cacheProvider: true,
      });
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const signer = provider.getSigner();
      /* next, create the item */
      // 连接NFT合约，进行铸币
      let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
      let transaction = await contract.mintOneToken(url);
       // 数据刷新
      await transaction.wait();
      if (transaction) {
        this.$message.warning("上传至NFT成功");
        this.$router.push({
          path: "/index/CreatorDashboard",
        });
      }else{
        this.$alert("上传失败", "失败", {
          dangerouslyUseHTMLString: true,
        });
      }
    },
  },
  // 创建后
  created() {},
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
.createItem {
  .el-form {
    .el-form-item {
      width: 30rem;
    }
  }
  .createItem-Btn {
    display: flex;
    .el-input {
      width: 14rem;
      margin: 0 4rem 0 1rem;
    }
  }
}
</style>
