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
      collectUrl: collect?.bookCover || "/images/index/add.png",
      isCollect: collect ? true : false,
    });
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
  goSearch(){
    publicFn.Loading();
    goTo("compSearch");
  },
  goService(){
    publicFn.Loading();
    goTo("mycomp");
  }
});
