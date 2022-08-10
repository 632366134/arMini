// app.js
const { API } = require("./utils/request.js");

App({

  async onLaunch() {
    let data = {
      pagination: "1",
      pageNum: "5",
      page: "1",
      projectName: "",
      customerCode: "",
    };
    let list = await API.selProjects(data);
    wx.setStorageSync("list", list.list);
    console.log(list);
  },
});
