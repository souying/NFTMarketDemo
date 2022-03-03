<template>
  <div :id="'container'+ids"  class="webgl" ref="webgl"></div>
</template>
<script>
import * as THREE from "@/utils/three.min.js";
import { OrbitControls } from "@/utils/OrbitControls.js";
import { OBJLoader } from "@/utils/OBJLoader.js";
import { MTLLoader } from "@/utils/MTLLoader.js";
export default {
  props: ["modelName","ids"],
  data() {
    return {
      container: "", //容器
      renderer: "", //渲染器
      scene: "", // 场景
      camera: "", // 相机
      controller: "", //视角控制器
      light: "", //光
      stats: "", //性能检测器
    };
  },
  created() {
    this.$nextTick(() => {
      this.threeStart();
    });
    // console.log(this.modelName);
  },
  methods: {
    // 初始化
    threeStart() {
      // canvas容器
      this.container = document.getElementById('container'+this.ids);
      // document.body.appendChild(this.container);
      // 场景
      this.initScene();
      // 渲染器
      this.initThree();
      // 相机
      this.initCamera();
      // 插件
      this.plugIn();
      // 光
      this.initLight();
      // 画的内容
      this.initObject();
      // 游戏循环
      this.render();
    },
    // 渲染器
    initThree() {
      // 创建渲染器
      this.renderer = new THREE.WebGLRenderer({
        // 在 css 中设置背景色透明显示渐变色
        alpha: true,
        // 开启抗锯齿
        antialias: true,
      });
      // 渲染背景颜色同雾化的颜色
      // this.renderer.setClearColor(this.scene.fog.color);
      // 定义渲染器的尺寸；在这里它会填满整个屏幕
      // console.log(this.container.clientWidth, this.container.clientHeight);
      this.renderer.setSize(200, 200);
      // 打开渲染器的阴影地图
      this.renderer.shadowMap.enabled = true;
      // renderer.shadowMapSoft = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      // 在 HTML 创建的容器中添加渲染器的 DOM 元素
      this.container.appendChild(this.renderer.domElement);
      // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
      // window.addEventListener('resize', handleWindowResize.bind(this), false);
    },
    // 窗口大小变动时调用
    handleWindowResize() {
      // // 更新渲染器的高度和宽度以及相机的纵横比
      // this.renderer.setSize(window.innerWidth, window.innerHeight);
      // this.camera.aspect = window.innerWidth / window.innerHeight;
      // this.camera.updateProjectionMatrix();
    },
    // 插件
    plugIn() {
      // 性能检测器
      // this.stats = new Stats();
      // this.container.appendChild(this.stats.dom);
      //视角控制
      this.controller = new OrbitControls(
        this.camera,
        this.renderer.domElement
      );
      this.controller.target = new THREE.Vector3(0, 0, 0); //设置控制点
      this.controller.autoRotate = true;
      // // 点击事件
      // this.container.addEventListener("mousedown", (event) => {
      //   let mouse = new THREE.Vector2();
      //   let raycaster = new THREE.Raycaster();
      //   // 计算鼠标点击位置转换到3D场景后的位置
      //   mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      //   mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      //   // 由当前相机（视线位置）像点击位置发射线
      //   raycaster.setFromCamera(mouse, this.camera);
      //   let intersects = raycaster.intersectObjects(this.scene.children, true)
      //   if (intersects.length > 0) {
      //     // 拿到射线第一个照射到的物体
      //     console.log(intersects[0].object);
      //   }
      // });
      // 辅助线
      // this.scene.add(new THREE.GridHelper(50, 50, 0xffffff, 0x555555));
    },
    // 场景
    initScene() {
      this.scene = new THREE.Scene();
      // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
      this.scene.fog = new THREE.Fog(0xeeeeee, 1, 600);
    },
    // 相机
    initCamera() {
      this.camera = new THREE.PerspectiveCamera(
        45,
        this.container.clientWidth / this.container.clientHeight,
        1,
        10000
      );
      this.camera.position.z = 80;
    },
    // 初始化光
    initLight() {
      // 户外光源
      // 第一个参数是天空的颜色，第二个参数是地上的颜色，第三个参数是光源的强度
      let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 2);

      // 环境光源
      let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);

      // 方向光是从一个特定的方向的照射
      // 类似太阳，即所有光源是平行的
      // 第一个参数是关系颜色，第二个参数是光源强度
      let shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

      // 设置光源的位置方向
      shadowLight.position.set(50, 50, 50);

      // 开启光源投影
      shadowLight.castShadow = true;

      // 定义可见域的投射阴影
      shadowLight.shadow.camera.left = -400;
      shadowLight.shadow.camera.right = 400;
      shadowLight.shadow.camera.top = 400;
      shadowLight.shadow.camera.bottom = -400;
      shadowLight.shadow.camera.near = 1;
      shadowLight.shadow.camera.far = 1000;

      // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能的表现。
      shadowLight.shadow.mapSize.width = 2048;
      shadowLight.shadow.mapSize.height = 2048;

      // 为了使这些光源呈现效果，需要将它们添加到场景中
      this.scene.add(hemisphereLight);
      this.scene.add(shadowLight);
      this.scene.add(ambientLight);
    },
    // 画内容
    initObject() {
      let that = this;
      const mtlLoader = new MTLLoader();
      function mtlFun(mtlurl, objurl, x, y, z) {
        mtlLoader.load(mtlurl, (mtl) => {
          for (const key in mtl.materialsInfo) {
            let val = mtl.materialsInfo[key];
            let urls = val.map_kd.split("\\");
            val.map_kd = `${that.modelName}/${urls[urls.length - 1]}`;
          }
          mtl.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(mtl);
          objLoader.load(objurl, (obj) => {
            obj.traverse(function (child) {
              if (child.material) {
                child.material.transparent = true; // 默认为true,可省略
                child.material.alphaTest = 0.9;
                child.material.depthWrite = true; // 默认为true,可省略
              }
            });
            obj.position.set(x, y, z);
            that.scene.add(obj);
          });
        });
      }
      mtlFun(
        // "/static/models/3d/2/2.mtl",
        `${that.modelName}/1.mtl`,
        `${that.modelName}/1.obj`,
        -15,
        -30,
        30
      ); // 中间

      // mtlFun("/static/models/3d/3/3.mtl","/static/models/3d/3/3.obj",0,30,0); // 上中
      // mtlFun("/static/models/3d/4/4.mtl","/static/models/3d/4/4.obj",0,-90,0); // 下中
      // mtlFun("/static/models/3d/5/5.mtl","/static/models/3d/5/5.obj",60,-30,0); // 左中
      // mtlFun("/static/models/3d/6/6.mtl","/static/models/3d/6/6.obj",-60,-30,0); // 右中
      // mtlFun("/static/models/3d/7/7.mtl","/static/models/3d/7/7.obj",-60,30,0); // 左上
      // mtlFun("/static/models/3d/8/8.mtl","/static/models/3d/8/8.obj",60,30,0);  // 右上
      // mtlFun("/static/models/3d/9/9.mtl","/static/models/3d/9/9.obj",-60,-90,0);  // 左下
      // mtlFun("/static/models/3d/10/10.mtl","/static/models/3d/10/10.obj",60,-90,0);  // 右下
    },
    // 游戏循环
    render() {
      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.render);
      // this.stats.update();
      // TWEEN.update();
    },
  },
};
</script>

<style lang="less" scoped>
.webgl {
  // width:1200px;
  // width: 200px;
  // height: 200px;
  background-color: #dcdfe6;
  // background: url("../../../assets/images/home/model_bg.png") no-repeat center
  // top;
}
</style>
