// index.js
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");

Page({
  data: {
    list: [],
    compList: [],
    collectUrl: "/images/index/add.png",
    isCollect: false,
    collect: [],
    isMask: false,
    borchureDetail: {},
  },
  onLoad() {},
  goColllect() {
    publicFn.Loading();
    goTo("collect");
  },
  onShow() {
    publicFn.LoadingOff();
    let list = wx.getStorageSync("list");
    let collect = wx.getStorageSync("collect");

    let compList = list.slice(0, 3);
    this.setData({
      list,
      compList,
      collect,
      collectUrl:
        collect?.bookCover == true
          ? "https://ar-test-0824.obs.cn-east-3.myhuaweicloud.com" + collect.bookCoverObsPath + collect.bookCoverObsName
          : "/images/index/add.png",
      isCollect: collect ? true : false,
    });
    console.log(compList, "compList",collect);
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
