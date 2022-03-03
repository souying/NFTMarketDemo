import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    redirect: '/index/Home'
  },
  {
    path: "/index",
    name: "index",
    component: () => import("../views/Index.vue"),

    //嵌套二级路由
    children: [
      {
        path: "/index/Home",
        name: "/index/Home",
        component: () => import("../views/modules/Home.vue")
      },
      {
        path: "/index/CreatorDashboard",
        name: "/index/CreatorDashboard",
        component: () => import("../views/modules/CreatorDashboard.vue")
      },
      {
        path: "/index/CreateItem",
        name: "/index/CreateItem",
        component: () => import("../views/modules/CreateItem.vue")
      },
      {
        path: "/index/MyDigitalAssets",
        name: "/index/MyDigitalAssets",
        component: () => import("../views/modules/MyDigitalAssets.vue")
      },
      {
        path: "/index/SellDigitalAsset",
        name: "/index/SellDigitalAsset",
        component: () => import("../views/modules/SellDigitalAsset.vue")
      },
      {
        path: "/index/MyPledged",
        name: "/index/MyPledgeds",
        component: () => import("../views/modules/MyPledged.vue")
      },
      {
        path: "/index/CreateItemss",
        name: "/index/CreateItemss",
        component: () => import("../views/modules/CreateItemss.vue")
      }
    ],
  },
];

const router = new VueRouter({
  routes,
});

export default router;
