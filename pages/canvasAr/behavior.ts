import * as THREE from "three-platformize";
import { WechatPlatform } from "three-platformize/src/WechatPlatform";
import { GLTFLoader } from "three-platformize/examples/jsm/loaders/GLTFLoader";
import { OBJLoader } from "three-platformize/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three-platformize/examples/jsm/loaders/MTLLoader";
import { FBXLoader } from "three-platformize/examples/jsm/loaders/FBXLoader";
import { STLLoader } from "three-platformize/examples/jsm/loaders/STLLoader";

const { API } = require("../../utils/request");
import cloneGltf from "../../loaders/gltf-clone";
const publicFn = require("../../utils/public");
const w = 300;
let h = 200,
  box;

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
      src: "",
      videoShow: true,
      left: "50%",
      type: "",
      h: 0,
      mediaUrl: "",
    },
    methods: {
      onReady() {
        wx.showLoading({
          title: "加载中",
        });
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
            this.initTHREE();

          });
      },
      onReady2() {
        if (this.data.type === "mp4") {
          console.log("mp4mp4", this.data.mediaUrl);
          let downloadTask = wx.downloadFile({
            url: this.data.mediaUrl,
            //   url:"https://view.2amok.com/20220823/2643babed380fe8da238288e3370d32e.mp4",
            success: (e) => {
              this.setData({ src: e.tempFilePath });
            },
            fail(e) {
              console.log("download fail", e);
            },
            complete() {
              downloadTask.offHeadersReceived;
              wx.hideLoading();
            },
          });
          downloadTask.onProgressUpdate((res) => {
            console.log("aaaa");
            console.log("下载进度", res.progress);
            console.log("已经下载的数据长度", res.totalBytesWritten);
            console.log(
              "预期需要下载的数据总长度",
              res.totalBytesExpectedToWrite
            );
          });
        } else {
          this.initVK();
        }
      },
      back() {
        this.onUnload();
        wx.navigateBack({
          delta: 2,
        });
      },
      loadedmetadata(e) {
        // console.log("loadedmetadata");
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
                this.initVK();
                console.log("select canvas", res);
                this.ctx1 = res[0].node.getContext("2d");
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
        console.log("unload");
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
          //   version: "v1",
          gl: this.gl,
        }));
        session.start(async (err) => {
          if (err) return console.error("VK error: ", err);
          this.addMarker();
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
          session.on("resize", () => {
            const info = wx.getSystemInfoSync();
            calcSize(
              info.windowWidth,
              info.windowHeight,
              //   info.windowHeight,
              info.pixelRatio
            );
          });
          await this.loading();
          const getModelList = () => {
            let markerId = this.data.markerId;
            if (!this.modelList) {
              this.modelList = [];
            }
            this.modelList.push({
              markerId,
              model: this.data.type === "mp4" ? this.video : this.model,
              type: this.data.type,
            });
            console.log(this.modelList, "modelList");
          };
          if (this.data.type === "mp4") {
            wx.nextTick(() => {
              getModelList();
            });
          } else {
            getModelList();
          }
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
            console.log("加载模型1");
            anchors.forEach((anchor) => {
              const size = anchor.size;
              const markerId = anchor.markerId;
              console.log(this.modelList, markerId);
              this.modelList.forEach((element, index) => {
                if (element.markerId === markerId) {
                  this.model = element.model;
                  this.type2 = element.type;
                }
              });
              let object;
              if (size && DEBUG_SIZE) {
                object = createPlane(size);
              } else {
                // if (!this.model) {
                //   console.warn("this.model 还没加载完成 ！！！！！");
                //   return;
                // }

                object = new THREE.Object3D();
                let model;
                if (
                  this.type2 === "obj" ||
                  this.type2 === "fbx" ||
                  this.type2 === "stl" ||
                  this.type2 === "png"
                ) {
                  model = this.model;
                  object.add(model);
                } else if (this.type2 === "mp4") {
                  if (this.data.left !== "50%") this.setData({ left: "50%" });
                  this.video = this.model;
                  this.video.play();
                  setInterval(() => {
                    this.ctx1.drawImage(
                      this.video,
                      0,
                      0,
                      w * info.pixelRatio,
                      h * info.pixelRatio
                    );
                  }, 1000 / 24);
                  return;
                } else if (this.type2 === "glb") {
                  model = this.getRobot();
                  model.rotateX(-Math.PI / 2);
                  object.add(model);
                } else {
                }
              }

              object._id = anchor.id;
              object._size = size;
              updateMatrix(object, anchor.transform);
              this.planeBox.add(object);
              console.log("加载模型2");
              //   this.planeBox.add(this.cube);加载png贴图
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
                  //   object = createPlane(size);
                  this.planeBox.add(object);
                  //   if (this.data.type === "png") {
                  //     this.planeBox.remove(this.cube);
                  //     object = createPlane(size);
                  //     this.planeBox.add(this.cube);
                  //   }
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
            if (this.type2 === "mp4") {
              this.video.pause();
              this.setData({ left: "200%" });
            }
            // if (this.data.type === "png") {
            //   this.planeBox.remove(this.cube);
            // }
          });

          // 平面集合

          const planeBox = (this.planeBox = new THREE.Object3D());
          planeBox.scale.set(0.5, 0.5, 0.5);
          this.scene.add(planeBox);

          // 逐帧渲染
          this.setData({ isShowScan: true });
          const onFrame = (timestamp) => {
            // let start = Date.now()
            const frame = session.getVKFrame(canvas.width, canvas.height);
            if (frame) {
              this.render(frame);
            }
            session.requestAnimationFrame(onFrame);
          };
          session.requestAnimationFrame(onFrame);
        });
      },
      initTHREE() {
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
        const light = new THREE.AmbientLight(0x404040); // soft white light
        scene.add(light);
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
        renderer.outputEncoding = THREE.sRGBEncoding;
        // renderer.outputEncoding = THREE.LinearEncoding;
      },
      updateAnimation() {
        const dt = this.clock.getDelta();
        if (this.mixers) this.mixers.forEach((mixer) => mixer.update(dt));
      },
      copyRobot() {
        const THREE = this.THREE;
        if (this.data.type === "glb") {
          const { scene, animations } = cloneGltf(this.model, THREE);
          scene.scale.set(0.5, 0.5, 0.5);

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
        } else {
          const mixer = new THREE.AnimationMixer(this.scene);

          const action = mixer.clipAction(this.model.animations[0]);
          action.play();
          return this.scene;
        }
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
      loading() {
        return new Promise((resolve, reject) => {
          if (this.data.type === "mp4") resolve("mp4");

          const onProgress = (xhr) => {
            console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
          };
          const onErr = (error) => {
            console.log("An error happened", error);
          };
          const ojbFun = async () => {
            const mtlLoader = new MTLLoader();
            const objLoader = new OBJLoader();
            const materials = (await mtlLoader.loadAsync(
              "https://techbrood.com/threejs/examples/models/obj/male02/male02.mtl"
            )) as MTLLoader.MaterialCreator;
            materials.preload();
            const object = (await objLoader
              .setMaterials(materials)
              .loadAsync(
                "https://techbrood.com/threejs/examples/models/obj/male02/male02.obj"
              )) as THREE.Group;
            object.position.y = -95;
            console.log(object);
            this.model = object;
            this.model.scale.set(0.05, 0.05, 0.05);
            this.model.rotateX(-Math.PI / 4);
            resolve(object);
          };
          const glbFun = async () => {
            await new GLTFLoader().load(
              //   "https://dldir1.qq.com/weixin/miniprogram/RobotExpressive_aa2603d917384b68bb4a086f32dabe83.glb",
              // https://techbrood.com/threejs/examples/models/gltf/SimpleSkinning.gltf
              this.data.mediaUrl,
              async (gltf) => {
                this.model = {
                  scene: gltf.scene,
                  animations: gltf.animations,
                };
                console.log(gltf, "gltfgltfgltf");

                resolve(gltf);
              },
              onProgress,
              onErr
            );
          };
          const stlFun = () => {
            new STLLoader().load(
              this.data.mediaUrl,
              (stl) => {
                console.log(stl);
                const material = new THREE.MeshPhongMaterial({
                  color: 0xff5533,
                  specular: 0x111111,
                  shininess: 200,
                });
                const mesh = new THREE.Mesh(stl, material);

                mesh.position.set(0, -0.25, 0.6);
                mesh.rotation.set(0, -Math.PI / 2, 0);
                mesh.scale.set(5, 5, 5);

                mesh.castShadow = true;
                mesh.receiveShadow = true;
                stl.center();
                this.model = mesh;
                // this.scene.add(mesh)
                resolve(mesh);
              },
              onProgress,
              onErr
            );
          };
          const fbxFun = async () => {
            console.log(this.data.mediaUrl);
            const loader = new FBXLoader();
            const object = await loader.load(
              //   "https://techbrood.com/threejs/examples/models/fbx/Samba%20Dancing.fbx",
              this.data.mediaUrl,
              // "https://ar-test-0824.obs.cn-east-3.myhuaweicloud.com/undefined/286688538297585664/android/Wutai.fbx",
              (gltf) => {
                console.log(gltf);
                this.model = gltf;
                gltf.scale.set(0.01, 0.01, 0.01);

                this.model.rotateX(-Math.PI / 2);
                const mixer = new THREE.AnimationMixer(this.model);
                this.mixers = this.mixers || [];
                this.mixers.push(mixer);
                const action = mixer.clipAction(this.model.animations[0]);
                action.play();
                this.model.traverse(function (child) {
                  // @ts-ignore
                  if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                  }
                });
                resolve(gltf);
              },
              onProgress,
              onErr
            );
          };
          const pngFun = async () => {
            let geometry = new THREE.PlaneGeometry(2, 2);
            let loader = new THREE.TextureLoader();
            const texture = await loader.loadAsync(this.data.mediaUrl);
            const material = new THREE.MeshBasicMaterial({
              side: THREE.DoubleSide,
              map: texture,
              transparent: true,
              opacity: 0.5,
            });
            material.map = texture;
            texture.minFilter = THREE.NearestFilter;
            texture.flipY = false;
            texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;

            let model = (this.model = new THREE.Mesh(geometry, material));
            model.traverse(function (node) {
              if (node instanceof THREE.Mesh) {
                node.castShadow = true;
                node.material.map = texture;
                node.material.needsUpdate = true;
                node.material.emissiveMap = node.material.map;
              }
            });

            model.rotation.set(-Math.PI / 2, 0, 0);
            model.position.set(0, 0, 0.6);
            resolve(model);
          };
          try {
            if (this.data.type === "fbx") {
              fbxFun();
            } else if (this.data.type === "obj") {
              ojbFun();
            } else if (this.data.type === "stl") {
              stlFun();
            } else if (this.data.type === "glb") {
              glbFun();
            } else if (this.data.type === "png") {
              pngFun();
            }
          } catch (error) {
            console.log(error);
          }
        });
      },
    },
  });
}
