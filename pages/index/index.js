// index.js
// 获取应用实例
import {goTo} from '../../utils/navigate'
Page({
  data: {
      list:[],
      compList:[]
  },
  onLoad() {
    let list = wx.getStorageSync('list').list
    let compList = list.slice(0,3)
    this.setData({
        list,
        compList
    })
  },
  goColllect(){
      goTo('collect')
  }


})
