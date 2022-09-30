import * as THREE from "three-platformize";
import { RGBELoader } from "three-platformize/examples/jsm/loaders/RGBELoader";
import { WechatPlatform } from "three-platformize/src/WechatPlatform";

// import { OrbitControls } from "three-platformize/examples/jsm/controls/OrbitControls";
import { goTo } from "../../../utils/navigate";
let DEBUG_SIZE = false; // 目前支持不完善

export default function getBehavior() {
  return Behavior({
    data: {
      width: 1,
      height: 1,
      fps: 0,
      memory: 0,
      cpu: 0,
      list: [],
    },
    methods: {
      onReady() {
        console.log("onReady2");
        wx.createSelectorQuery()
          .select("#webgl")
          .node()
          .exec((res) => {
            this.canvas = res[0].node;

            const info = wx.getSystemInfoSync();
            const pixelRatio = info.pixelRatio;
            const calcSize = (width, height) => {
              console.log(`canvas size: width = ${width} , height = ${height}`);
              this.canvas.width = (width * pixelRatio) / 2;
              this.canvas.height = (height * pixelRatio) / 2;
              this.setData({
                width,
                height,
              });
            };
            calcSize(info.windowWidth, info.windowHeight);

            this.initVK();
          });
      },
      onUnload() {
        if (THREE.PLATFORM) {
            THREE.PLATFORM.dispose();
          }
        if (this._texture) {
          this._texture.dispose();
          this._texture = null;
        }
        if (this.renderer) {
          this.renderer.dispose();
          this.renderer = null;
        }
        if (this.scene) {
          this.scene.dispose();
          this.scene = null;
        }
        if (this.camera) this.camera = null;
        if (this.model) this.model = null;
        if (this._insertModel) this._insertModel = null;
        if (this._insertModels) this._insertModels = null;
        if (this.planeBox) this.planeBox = null;
        if (this.mixers) {
          this.mixers.forEach((mixer) => mixer.uncacheRoot(mixer.getRoot()));
          this.mixers = null;
        }
        if (this.clock) this.clock = null;

        if (this.THREE) this.THREE = null;
        if (this._tempTexture && this._tempTexture.gl) {
          this._tempTexture.gl.deleteTexture(this._tempTexture);
          this._tempTexture = null;
        }
        if (this._fb && this._fb.gl) {
          this._fb.gl.deleteFramebuffer(this._fb);
          this._fb = null;
        }
        if (this._program && this._program.gl) {
          this._program.gl.deleteProgram(this._program);
          this._program = null;
        }
        if (this.canvas) this.canvas = null;
        if (this.gl) this.gl = null;
        if (this.session) this.session = null;
        if (this.anchor2DList) this.anchor2DList = [];
      },
    
      initVK() {
        // 初始化 threejs
        this.initTHREE();
        const THREE = this.THREE;
        // 自定义初始化
        if (this.init) this.init();

        console.log("this.gl", this.gl);

        const isSupportV2 = wx.isVKSupport("v2");
        const session = (this.session = wx.createVKSession({
          track: {
            plane: {
              mode: 3,
            },
            marker: true,
          },
          version: isSupportV2 ? "v2" : "v1",
          gl: this.gl,
        }));

        session.start((err) => {
          if (err) return console.error("VK error: ", err);

          console.log("@@@@@@@@ VKSession.version", session.version);

          const canvas = this.canvas;

          const calcSize = (width, height, pixelRatio) => {
            console.log(`canvas size: width = ${width} , height = ${height}`);
            this.canvas.width = (width * pixelRatio) / 2;
            this.canvas.height = (height * pixelRatio) / 2;
            this.setData({
              width,
              height,
            });
          };
          const loader = new RGBELoader();
          loader.load(
            "http://www.yanhuangxueyuan.com/threejs/examples/textures/equirectangular/venice_sunset_2k.hdr",
            (texture) => {
              console.log(texture);
              texture.mapping = THREE.EquirectangularReflectionMapping;
              //将加载的材质texture设置给背景和环境
              this.scene.background = texture;
              this.scene.environment = texture;
            }
          );

          // 创建轨道控制器
          const controls = new THREE.OrbitControls(this.camera, this.canvas);
          // 设置控制器阻尼，让控制器更有真实效果,必须在动画循环里调用.update()。
          controls.enableDamping = true;
          // 添加坐标轴辅助器
          const axesHelper = new THREE.AxesHelper(5);
          this.scene.add(axesHelper);
          // 设置时钟
        //   this.clock = new THREE.Clock();

        //   function render() {
        //     controls.update();
        //     this.renderer.render(this.scene, this.camera);
        //     //   渲染下一帧的时候就会调用render函数
        //     requestAnimationFrame(render);
        //   }
        //   render();
          session.on("resize", () => {
            const info = wx.getSystemInfoSync();
            calcSize(
              info.windowWidth,
              info.windowHeight * 0.8,
              //   info.windowHeight,
              info.pixelRatio
            );
          });

          const createPlane = (size) => {
            const geometry = new THREE.PlaneGeometry(size.width, size.height);
            const material = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.5,
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotateX(Math.PI / 2);
            const cnt = new THREE.Object3D();
            cnt.add(mesh);
            return cnt;
          };
          const updateMatrix = (object, m) => {
            object.matrixAutoUpdate = false;
            object.matrix.fromArray(m);
          };
          session.on("addAnchors", (anchors) => {
            anchors.forEach((anchor) => {
              const size = anchor.size;
              let object;
              if (size && DEBUG_SIZE) {
                object = createPlane(size);
              } else {
              

                object = new THREE.Object3D();
                // const model = this.getRobot();
                const model = this.model;

                model.rotateX(-Math.PI / 2);
                object.add(model);
              }

              object._id = anchor.id;
              object._size = size;
              updateMatrix(object, anchor.transform);
              this.planeBox.add(object);
            });
          });
          session.on("updateAnchors", (anchors) => {
            const map = anchors.reduce((temp, item) => {
              temp[item.id] = item;
              return temp;
            }, {});
            this.planeBox.children.forEach((object) => {
              if (object._id && map[object._id]) {
                const anchor = map[object._id];
                const size = anchor.size;
                if (
                  size &&
                  DEBUG_SIZE &&
                  object._size &&
                  (size.width !== object._size.width ||
                    size.height !== object._size.height)
                ) {
                  this.planeBox.remove(object);
                  object = createPlane(size);

                  this.planeBox.add(object);
                }

                object._id = anchor.id;
                object._size = size;
                updateMatrix(object, anchor.transform);
              }
            });
          });
          session.on("removeAnchors", (anchors) => {
            const map = anchors.reduce((temp, item) => {
              temp[item.id] = item;
              return temp;
            }, {});
            this.planeBox.children.forEach((object) => {
              if (object._id && map[object._id]) this.planeBox.remove(object);
            });
          });

          // 平面集合
          const planeBox = (this.planeBox = new THREE.Object3D());
          this.scene.add(planeBox);

        });
        this.clock = new THREE.Clock();
        const onFrame = (timestamp) => {
            // let start = Date.now()
            const frame = session.getVKFrame(this.canvas.width, this.canvas.height);
            if (frame) {
              this.render(frame);
            }

            session.requestAnimationFrame(onFrame);
          };
          session.requestAnimationFrame(onFrame);
      },
      initTHREE() {
        const platform = new WechatPlatform(this.canvas);
        this.platform = platform;
        platform.enableDeviceOrientation("game");
        THREE.PLATFORM.set(platform);
        this.THREE = THREE;

        // 相机
        // const camera = (this.camera = new THREE.PerspectiveCamera(
        //   75,
        //   window.innerWidth / window.innerHeight,
        //   0.1,
        //   1000
        // ));
        const camera = (this.camera = new THREE.Camera())
        camera.position.set(0, 0, 10);
        // 场景
        const scene = (this.scene = new THREE.Scene());
        scene.add(camera);
        // 光源
        const light1 = new THREE.HemisphereLight(0xffffff, 0x444444); // 半球光
        light1.position.set(0, 0.2, 0);
        scene.add(light1);
        const light2 = new THREE.DirectionalLight(0xffffff); // 平行光
        light2.position.set(0, 0.2, 0.1);
        scene.add(light2);

        // 渲染层
        const renderer = (this.renderer = new THREE.WebGL1Renderer({
          antialias: true,
          alpha: true,
        }));
        // renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;
      },
    },
  });
}
