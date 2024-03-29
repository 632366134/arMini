import * as THREE from "three-platformize";
import { GLTFLoader } from "three-platformize/examples/jsm/loaders/GLTFLoader";
import { WechatPlatform } from "three-platformize/src/WechatPlatform";

const { API } = require("../../utils/request");
import cloneGltf from "../../loaders/gltf-clone";
const publicFn = require("../../utils/public");

const info = wx.getSystemInfoSync();
let DEBUG_SIZE = false; // 目前支持不完善

export default function getBehavior() {
  return Behavior({
    data: {
      width: 1,
      height: 1,
      fps: 0,
      memory: 0,
      cpu: 0,
    },
    methods: {
      onReady() {
        console.log("ready");
        wx.createSelectorQuery()
          .select("#webgl")
          .node()
          .exec((res) => {
            this.canvas = res[0].node;
            publicFn.LoadingOff();
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
        if (THREE.PLATFORM) {
          THREE.PLATFORM.dispose();
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
          this.addMarker();

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
          session.on("resize", () => {
            const info = wx.getSystemInfoSync();
            calcSize(
              info.windowWidth,
              info.windowHeight * 0.8,
              //   info.windowHeight,
              info.pixelRatio
            );
          });

          //   const loader = new THREE.GLTFLoader();
          //   loader.load(
          //     "https://dldir1.qq.com/weixin/miniprogram/RobotExpressive_aa2603d917384b68bb4a086f32dabe83.glb",
          //     (gltf) => {
          //       this.model = {
          //         scene: gltf.scene,
          //         animations: gltf.animations,
          //       };
          //     },
          //     (progress) => {
          //       console.log(progress);
          //     }
          //   );
          //   this.loading(THREE).then((res) => {
          this.clock = new THREE.Clock();

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
                if (!this.model) {
                  console.warn("this.model 还没加载完成 ！！！！！");
                  return;
                }

                object = new THREE.Object3D();
                const model = this.getRobot();
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

          // 逐帧渲染
          const onFrame = (timestamp) => {
            // let start = Date.now()
            const frame = session.getVKFrame(canvas.width, canvas.height);
            if (frame) {
              this.render(frame);
            }

            session.requestAnimationFrame(onFrame);
          };
          session.requestAnimationFrame(onFrame);
          //   });
        });
      },
      async initTHREE() {
        // const THREE = (this.THREE = createScopedThreejs(this.canvas));
        const platform = new WechatPlatform(this.canvas);
        this.platform = platform;
        platform.enableDeviceOrientation("game");
        THREE.PLATFORM.set(platform);
        this.THREE = THREE;

        // registerGLTFLoader(THREE);
        // 相机
        this.camera = new THREE.Camera();

        // 场景
        const scene = (this.scene = new THREE.Scene());

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
          canvas: this.canvas,
        }));
        // renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;
        // await this.loading(THREE);
        this.loading(THREE);
      },
      updateAnimation() {
        const dt = this.clock.getDelta();
        if (this.mixers) this.mixers.forEach((mixer) => mixer.update(dt));
      },
      copyRobot() {
        const THREE = this.THREE;
        const { scene, animations } = cloneGltf(this.model, THREE);
        scene.scale.set(0.3, 0.3, 0.3);

        // 动画混合器
        const mixer = new THREE.AnimationMixer(scene);
        for (let i = 0; i < animations.length; i++) {
          const clip = animations[i];
          if (clip.name === "Dance") {
            const action = mixer.clipAction(clip);
            action.play();
          }
        }

        this.mixers = this.mixers || [];
        this.mixers.push(mixer);

        scene._mixer = mixer;
        return scene;
      },
      getRobot() {
        const THREE = this.THREE;

        const model = new THREE.Object3D();
        model.add(this.copyRobot());

        this._insertModels = this._insertModels || [];
        this._insertModels.push(model);

        if (this._insertModels.length > 5) {
          const needRemove = this._insertModels.splice(
            0,
            this._insertModels.length - 5
          );
          needRemove.forEach((item) => {
            if (item._mixer) {
              const mixer = item._mixer;
              this.mixers.splice(this.mixers.indexOf(mixer), 1);
              mixer.uncacheRoot(mixer.getRoot());
            }
            if (item.parent) item.parent.remove(item);
          });
        }

        return model;
      },
      onTouchEnd(evt) {
        // 点击位置放一个机器人
        const touches = evt.changedTouches.length
          ? evt.changedTouches
          : evt.touches;
        if (touches.length === 1) {
          const touch = touches[0];
          if (this.session && this.scene && this.model) {
            const hitTestRes = this.session.hitTest(
              touch.x / this.data.width,
              touch.y / this.data.height,
              this.resetPanel
            );
            this.resetPanel = false;
            if (hitTestRes.length) {
              const model = this.getRobot();
              model.matrixAutoUpdate = false;
              model.matrix.fromArray(hitTestRes[0].transform);
              this.scene.add(model);
            }
          }
        }
      },
      loading(THREE) {
        // return new Promise((resolve, reject) => {
        console.log(this.projectCode);
        //   API.selMediaApps({ "projectCode": this.projectCode }).then((res) => {
        //     console.log(res);
        //   });
        const loader = new GLTFLoader();

        let that = this;
        loader.load(
          "https://dldir1.qq.com/weixin/miniprogram/RobotExpressive_aa2603d917384b68bb4a086f32dabe83.glb",
          function (gltf) {
            console.log("gltfload");
            that.model = {
              scene: gltf.scene,
              animations: gltf.animations,
            };
          },
          function (xhr) {
            console.log("gltfloadingnoww");

            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          },
          function (err) {
            console.log("err!");
          }
        );
      },
    },
  });
}
