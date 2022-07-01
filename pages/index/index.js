// index.js
// 获取应用实例
import { goTo } from "../../utils/navigate";
const publicFn = require("../../utils/public");

Page({
  data: {
    list: [],
    compList: [],
    collectUrl: "/images/index/add.png",
    isCollect: false,
    collect: [],
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
      collectUrl: collect?.bookCover || "/images/index/add.png",
      isCollect: true,
    });
  },
});
