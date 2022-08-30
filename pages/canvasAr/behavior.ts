import * as THREE from "three-platformize";
import { GLTFLoader } from "three-platformize/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three-platformize/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three-platformize/examples/jsm/loaders/STLLoader";
import { MTLLoader } from "three-platformize/examples/jsm/loaders/MTLLoader";

import { WechatPlatform } from "three-platformize/src/WechatPlatform";
const { API } = require("../../utils/request");
import cloneGltf from "../../loaders/gltf-clone";
const publicFn = require("../../utils/public");
const w = 300;
let h = 200,
  box,
  ctx1,
  videotexture,
  videoImageContext,
  videoTexture;
const info = wx.getSystemInfoSync();
let DEBUG_SIZE = false; // 目前支持不完善
const mediaUrl = "https://ar-test-0824.obs.cn-east-3.myhuaweicloud.com/";

export default function getBehavior() {
  return Behavior({
    data: {
      width: 1,
      height: 1,
      fps: 0,
      memory: 0,
      cpu: 0,
      src: "",
      videoShow: true,
      left: "50%",
      type: "obj",
      h: 0,
    },
    methods: {
      onReady() {
        console.log("ready");
        wx.showLoading({
          title: "加载中",
        });
        if (this.data.type === "mp4") {
          wx.downloadFile({
            url:
              "https://view.2amok.com/20220823/2643babed380fe8da238288e3370d32e.mp4",
            success: (e) => {
              this.setData({ src: e.tempFilePath });
            },
            fail(e) {
              console.log("download fail", e);
            },
            complete() {
              wx.hideLoading();
            },
          });
        }

        wx.createSelectorQuery()
          .select("#webgl")
          .node()
          .exec((res) => {
            console.log(res);
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
      loadedmetadata(e) {
        console.log("loadedmetadata");
        h = (w / e.detail.width) * e.detail.height;
        this.setData(
          {
            h,
          },
          () => {
            this.draw();
          }
        );
      },
      draw() {
        const dpr = wx.getSystemInfoSync().pixelRatio;
        wx.createSelectorQuery()
          .select("#video")
          .context((res) => {
            console.log("select video", res);
            const video = (this.video = res.context);

            wx.createSelectorQuery()
              .selectAll("#cvs1")
              .node((res) => {
                console.log("select canvas", res);
                ctx1 = res[0].node.getContext("2d");
                res[0].node.width = w * dpr;
                res[0].node.height = h * dpr;
                // setInterval(() => {
                //   ctx1.drawImage(video, 0, 0, w * dpr, h * dpr);
                // }, 1000 / 24);
              })
              .exec();
          })
          .exec();
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
                let model;
                if (this.data.type === "obj") {
                  model = this.model;
                } else {
                  model = this.getRobot();
                  model.rotateX(-Math.PI / 2);
                }
                if (this.data.type === "mp4") {
                  if (this.data.left !== "50%") this.setData({ left: "50%" });
                  this.video.play();
                  setInterval(() => {
                    ctx1.drawImage(
                      this.video,
                      0,
                      0,
                      w * info.pixelRatio,
                      h * info.pixelRatio
                    );
                  }, 1000 / 24);
                }

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
                  this.planeBox.add(box);
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
            if (this.data.type === "mp4") {
              this.video.pause();
              this.setData({ left: "200%" });
            }
          });

          // 平面集合

          const planeBox = (this.planeBox = new THREE.Object3D());
          planeBox.scale.set(0.1, 0.1, 0.1);
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
        const platform = new WechatPlatform(this.canvas);
        this.platform = platform;
        platform.enableDeviceOrientation("game");
        THREE.PLATFORM.set(platform);
        this.THREE = THREE;
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
        await this.loading(THREE);
      },
      updateAnimation() {
        const dt = this.clock.getDelta();
        if (this.mixers) this.mixers.forEach((mixer) => mixer.update(dt));
      },
      copyRobot() {
        const THREE = this.THREE;
        const { scene, animations } = cloneGltf(this.model, THREE);
        // scene.scale.set(0.3, 0.3, 0.3);

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
      loading(THREE) {
        return new Promise((resolve, reject) => {
          let loader;
          if (this.data.type == "obj") {
            new MTLLoader().load(
              "https://techbrood.com/threejs/examples/models/obj/male02/male-02-1noCulling.JPG",
              (materials) => {
                console.log("materials");
                materials.preload();
                new OBJLoader()
                  .setMaterials(materials)
                  .load(
                    "https://techbrood.com/threejs/examples/models/obj/male02/male02.obj",
                    (gltf) => {
                      console.log(gltf, "model");
                      console.log("obj");
                      this.model = gltf;
                      this.model.scale.set(0.05, 0.05, 0.05);
                      this.model.rotateX(-Math.PI / 2);
                      resolve(gltf);
                    }
                  );
              }
            );
          } else if (this.data.type === "glb") {
            loader = new GLTFLoader();
          } else if (this.data.type === "stl") {
            loader = new STLLoader();
          }
          // https://dldir1.qq.com/weixin/miniprogram/RobotExpressive_aa2603d917384b68bb4a086f32dabe83.glb
          // https://techbrood.com/threejs/examples/models/obj/male02/male02.obj
          console.log("123", "21343124");
          //   loader.load(
          //     "https://techbrood.com/threejs/examples/models/obj/male02/male02.obj",
          //     (gltf) => {
          //       console.log(gltf,'model');
          //       if (this.data.type === "stl") {
          //         console.log('stl')

          //         const material = new THREE.MeshLambertMaterial({
          //           color: 0x7777ff,
          //         });
          //         this.mesh = new THREE.Mesh(gltf, material);
          //         this.mesh.rotation.x = -0.5 * Math.PI;
          //         this.mesh.scale.set(0.6, 0.6, 0.6);
          //         this.scene.add(this.mesh);
          //       } else {
          //         console.log('glb')
          //         this.model = {
          //           scene: gltf.scene,
          //           animations: gltf.animations,
          //         };
          //       }
          //       resolve(gltf);
          //     },
          //     (xhr) => {
          //       console.log("gltfloadingnoww");
          //       console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          //     },
          //     (err) => {
          //       console.log(err);
          //       reject(err)
          //     }
          //   );
        });
      },
    },
  });
}
