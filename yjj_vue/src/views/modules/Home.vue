<template>
  <div class="home">
    <!-- 主页内容盒子 -->
    <div class="home-contentBox">
      <div class="home-contentBox-show">
        <p>
          Account<span style="width: 24rem">{{ accountId }}</span>
        </p>
        <p>
          Balance<span style="width: 16rem">{{ balanceNum }}</span
          ><label>(ETH)</label>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Home",
  props: ["accountId","balanceNum"],
  // 模板引入
  components: {},
  // 数据
  data() {
    return {
      account: "", // 账户
      balance: "", // 余额
    };
  },
  // 方法
  methods: {

  },
  // 创建后
  created() {
  },
  // 挂载后
  mounted() {},
  // 更新后
  updated() {},
};
</script>

<style lang="less" scoped>
.home {
  h1 {
    color: rgb(0, 89, 255);
  }
  // 主页内容盒子
  .home-contentBox {
    margin: auto;
    margin-top: 2rem;
    width: 32rem;
    height: 15rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
    border-radius: 0.5rem;
    box-sizing: border-box;
    padding: 2rem;
    .home-contentBox-show {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      text-align: left;
      p {
        display: flex;
        font-size: 16px;
        margin: 1rem 0;
        align-items: center;
        span {
          margin-left: 0.5rem;
          background-color: #6495ed;
          border-radius: 1rem;
          width: 21rem;
          display: inline-block;
          height: 2rem;
          line-height: 2rem;
          font-size: 14px;
          color: #fff;
          text-indent: 0.5rem;
          margin-right: 0.3rem;
        }
      }
    }
  }
}
</style>
