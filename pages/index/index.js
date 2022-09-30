// index.js
const { API } = require("../../utils/request.js");
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");
const app = getApp();
Page({
  data: {
    list: [],
    compList: [],
    collectUrl: "/images/index/add.png",
    isCollect: false,
    collect: [],
    isMask: false,
    borchureDetail: {},
    isIPhoneX: app.isIPhoneX,

  },
  onLoad() {},
  goColllect() {
    publicFn.Loading();
    goTo("collect");
  },
  async onShow() {
    let list;
    list = wx.getStorageSync("list");
    if (list.length == 0) {
      let data = {
        pagination: "1",
        pageNum: "5",
        page: "1",
        projectName: "",
        userCode: "",
      };
      list = await API.selProjects(data);
      await wx.setStorageSync("list", list);
    }

    publicFn.LoadingOff();
    // let list = wx.getStorageSync("list");
    let collect = wx.getStorageSync("collect");
    let compList = list.slice(0, 3);
    this.setData({
      list,
      compList,
      collect,
      collectUrl:
        collect  ? "https://ar-test-0824.obs.cn-east-3.myhuaweicloud.com/" +collect.bookCoverObsPath + collect.bookCoverObsName
          : "/images/index/add.png",
      isCollect: collect ? true : false,
    });
    console.log(compList, "compList", collect);
  },
  goHistroy() {
    publicFn.Loading();
    goTo("history");
  },
  gopriview({ currentTarget }) {
 this.setData({
      isMask: true,
      borchureDetail: currentTarget.dataset.item,
    });
  },
  changeMask() {
    this.setData({
      isMask: false,
    });
  },
  goSearch() {
    publicFn.Loading();
    goTo("compSearch");
  },
  goService() {
    publicFn.Loading();
    goTo("mycomp");
  },
});
