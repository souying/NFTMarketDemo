<template>
  <el-container>
    <!-- 左侧 -->
    <el-aside width="200px">
      <el-menu
        background-color="#2C3E50"
        text-color="#6495ed"
        active-text-color="#6495ed"
        unique-opened
        router
        :default-active="$route.path"
      >
        <div v-for="obj in treelist" :key="obj.index">
          <el-menu-item :index="obj.index">
            <i :class="obj.i"></i>
            <span slot="title">{{ obj.text }}</span>
          </el-menu-item>
        </div>
      </el-menu>
    </el-aside>

    <!-- 右侧 -->
    <el-container>
      <!-- 右-头 -->
      <el-header>
        <p>Welcome To Market</p>
      </el-header>
      <!-- 右-身 -->
      <el-main>
        <el-card>
          <router-view :accountId="accountId" :balanceNum="balanceNum"></router-view>
        </el-card>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  props: ["accountId","balanceNum"],
  data() {
    return {
      accountIds: "", //账号
      treelist: [
        { index: "/index/Home", i: "el-icon-star-off", text: "Home" },
        {
          index: "/index/SellDigitalAsset",
          i: "el-icon-goods",
          text: "Sell Digital Asset",
        },
        {
          index: "/index/CreateItem",
          i: "el-icon-folder-add",
          text: "Create Item",
        },
        {
          index: "/index/CreatorDashboard",
          i: "el-icon-view",
          text: "Creator Dashboard",
        },
        {
          index: "/index/MyDigitalAssets",
          i: "el-icon-s-check",
          text: "My Digital Assets",
        },
        {
          index: "/index/MyPledged",
          i: "el-icon-s-check",
          text: "My Pledged",
        },
        // {
        //   index: "/index/CreateItemss",
        //   i: "el-icon-s-check",
        //   text: "CreateItemss",
        // },
      ],
    };
  },
};
</script>

<style lang="less" scoped>
.el-menu {
  border: 0;
}

.el-container {
  width: 100%;
  height: 100%;

  .el-aside {
    background-color: #2c3e50;
    // height: 100%;
  }

  .el-header {
    background-color: #6495ed;
    p {
      font-size: 2rem;
      line-height: 3rem;
      text-align: center;
      // margin: auto;
      color: #fff;
    }
  }
}
</style>
