<template>
  <div id="CreateItem">
    <el-form ref="form" :model="form" label-width="10rem">
      <!-- 上传的文字内容 -->
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
    </el-form>
    <div class="createItem-Btn">
      <!-- 文件夹 -->
      <input
        class="inputUploadDir"
        ref="file"
        type="file"
        name="file"
        webkitdirectory
        @change.stop="changesData"
      />
      <!-- 按钮 -->
      <el-button
        style="margin-left: 10px"
        size="medium"
        type="danger"
        @click="onSubmit"
        >Create Digital Asset</el-button
      >
    </div>
  </div>
</template>

<script>
// 引入相关文件
// import { create } from "ipfs-http-client";
//ipfs上传
import { Web3Storage } from "web3.storage/dist/bundle.esm.min.js";
//abi接口封装函数
import abiContract from "../../assets/js/abi.js";
export default {
  name: "CreateItem",
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      fileList: [], //上传文件夹内容
      form: {
        name: "", //名字
        desc: "", //描述
        price: "", //价格
      },
    };
  },
  // 方法
  methods: {
    changesData() {
      // change事件，监听上传的文件夹
      // console.log(this.$refs.file.files);
      this.fileList = this.$refs.file.files;
    },
    //
    async onSubmit() {
      // console.log(this.fileList);
      if (this.fileList.length < 1 || !this.form.name || !this.form.desc) {
        //所有内容必须不为空
        this.$message.warning("请选择需要上传的文件");
      } else {
        //获取到输入的文字
        const data = JSON.stringify({
          name: this.form.name,
          description: this.form.desc,
        });
        //将文字转为上传的格式
        const blob = new Blob([data]);
        const newFile = new File([blob], "test.json");
        //将文字追加进数组，传入ipfs上传函数
        this.fileList = [...this.fileList, newFile];
        this.upIpfs(this.fileList);
      }
    },
    //上传至ipfs
    async upIpfs(fileList) {
      const client = new Web3Storage({
        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDE5N2VEYTQ5QjQyRmVjRjI2QzBhNWM4OThmNUYzNzVGNDU1Y2U2MWEiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NDU1ODEwMDQ4NjAsIm5hbWUiOiJkZXYyMjAyIn0.s9DZmDbB1VasuMmI50RzfFavxwIachm0XuELGz5RZY4",
      });
      // Pack files into a CAR and send to web3.storage
      const rootCid = await client.put(fileList, {
        name: "files",
        maxRetries: 3,
      });
      let url = `https://ipfs.io/ipfs/${rootCid}`;
      // console.log(url);
      // 将ipfs的地址上传至铸币
      this.createSale(url);
    },

    async createSale(url) {
      // console.log(url);
      /* next, create the item */
      //重新构建abiContract引进函数
      let contract = await new abiContract();
      // console.log(contract);
      // 连接NFT合约，进行铸币
      let transaction = await contract.nftContract.mintOneToken(url);
      // 数据刷新
      await transaction.wait();
      if (transaction) {
        this.$message.warning("上传至NFT成功");
        this.$router.push({
          path: "/index/CreatorDashboard",
        });
      } else {
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
#CreateItem {
  .el-form {
    .el-form-item {
      width: 30rem;
    }
  }
  .createItem-Btn {
    display: flex;
    .inputUploadDir {
      width: 14rem;
      line-height: 3rem;
      border: 1px solid #909399;
      border-radius: 5px;
    }
    .el-input {
      width: 14rem;
      margin: 0 4rem 0 1rem;
    }
  }
}
</style>
