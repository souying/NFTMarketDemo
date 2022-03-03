import React from "react";
import { useEffect, useState } from "react";
import * as THREE from "../utils/three.min.js";
import { OrbitControls } from "../utils/OrbitControls.js";
import { OBJLoader } from "../utils/OBJLoader.js";
import { MTLLoader } from "../utils/MTLLoader.js";

export default function Model(props) {
  var container; // 容器
  var renderer; // 渲染器
  var scene; // 场景
  var camera; // 相机
  var controller; // 视角控制器
  var light; // 光源
  var stats; // 性能检测器
  useEffect(() => {
    threeStart();
  }, []);
  // 初始化
  async function threeStart() {
    // canvas容器
    container = document.getElementById("canvas");
    container.id = "canvas" + props.data.tokenId;
    // document.body.appendChild(container);
    // 场景
    initScene();
    // 渲染器
    initThree();
    // 相机
    initCamera();
    // 插件
    plugIn();
    // 光
    initLight();
    // 画的内容
    initObject();
    // 游戏循环
    render();
  }

  // 渲染器
  function initThree() {
    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
      // 在 css 中设置背景色透明显示渐变色
      alpha: true,
      // 开启抗锯齿
      antialias: true,
    });
    // 渲染背景颜色同雾化的颜色
    renderer.setClearColor(scene.fog.color);
    // 定义渲染器的尺寸；在这里它会填满整个屏幕
    // console.log(container.clientWidth, container.clientHeight);
    renderer.setSize(256, 272);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // 打开渲染器的阴影地图
    renderer.shadowMap.enabled = true;
    // renderer.shadowMapSoft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 在 HTML 创建的容器中添加渲染器的 DOM 元素
    container.appendChild(renderer.domElement);
    // 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
    window.addEventListener("resize", handleWindowResize.bind(this), false);
  }

  // 窗口大小变动时调用
  function handleWindowResize() {
    // 更新渲染器的高度和宽度以及相机的纵横比
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
  }
  // 插件
  function plugIn() {
    // 性能检测器
    // stats = new Stats();
    // container.appendChild(stats.dom);
    //视角控制
    controller = new OrbitControls(camera, renderer.domElement);
    controller.target = new THREE.Vector3(0, 0, 0); //设置控制点
    controller.autoRotate = true;
    // 点击事件
    container.addEventListener("mousedown", (event) => {
      let mouse = new THREE.Vector2();
      let raycaster = new THREE.Raycaster();
      // 计算鼠标点击位置转换到3D场景后的位置
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
      // 由当前相机（视线位置）像点击位置发射线
      raycaster.setFromCamera(mouse, camera);
      let intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        // 拿到射线第一个照射到的物体
        console.log(intersects[0].object);
      }
    });
    // 辅助线
    // this.scene.add(new THREE.GridHelper(50, 50, 0xffffff, 0x555555));
  }
  // 场景
  function initScene() {
    scene = new THREE.Scene();
    // 在场景中添加雾的效果，参数分别代表‘雾的颜色’、‘开始雾化的视线距离’、刚好雾化至看不见的视线距离’
    scene.fog = new THREE.Fog(0xeeeeee, 1, 600);
  }
  // 相机
  function initCamera() {
    camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      1,
      10000
    );
    camera.position.z = 80;
  }
  // 初始化光
  function initLight() {
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
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(ambientLight);
  }
  // 画内容
  function initObject() {
    const mtlLoader = new MTLLoader();
    function mtlFun(mtlurl, objurl, x, y, z) {
      mtlLoader.load(mtlurl, (mtl) => {
        for (const key in mtl.materialsInfo) {
          let val = mtl.materialsInfo[key];
          let urls = val.map_kd.split("\\");
          val.map_kd = `${props.data.addr}/${
            urls[urls.length - 1]
          }`;
          // console.log(val.map_kd);
        }
        mtl.preload();
        const objLoader = new OBJLoader();
        objLoader.setMaterials(mtl);
        objLoader.load(objurl, (obj) => {
          obj.traverse(function (child) {
            if (child.material) {
              child.material.transparent = true; // 默认为true,可省略
              child.material.alphaTest = 0.7;
              child.material.depthWrite = true; // 默认为true,可省略
            }
          });
          obj.position.set(x, y, z);
          scene.add(obj);
        });
      });
    }
    mtlFun(
      props.data.mtl,
      props.data.obj,
      -15,
      -30,
      0
    ); // 中间
    // mtlFun(
    //   "https://ipfs.io/ipfs/bafybeihcwnwnycaopdhfel7sc3yvt4aq6czxe4a2d45fhqv4wj55neo4pq/3.mtl",
    //   "https://ipfs.io/ipfs/bafybeihcwnwnycaopdhfel7sc3yvt4aq6czxe4a2d45fhqv4wj55neo4pq/3.obj",
    //   -15,
    //   -30,
    //   0
    // ); // 中间
    
  }
  // 游戏循环
  function render() {
    renderer.clear();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
    // stats.update();
    // TWEEN.update();
  }

  return (
      <div
        id="canvas"
        className="webgl"
        refs="webgl"
        style={{
          // display: "inline-block",
          width: "256px",
          height: "272px",
          backgroundColor: "#000",
          border:"0"
        }}
      ></div>
  );
}
