const baseUrl = "http://124.70.203.250:8081/";
function request(method, url, data) {
  return new Promise((resolve, reject) => {
    let header = {
      "content-type": "application/json",
    };

    wx.request({
      url: baseUrl + url,
      method: method,
      header: header,
      data: method === "POST" ? JSON.stringify(data) : data,
      success: (res) => {
        if (res.data.code === 1000) {
          resolve(res.data.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}
const code = wx.getStorageSync("userCode");
const API = {
  selProjects: (data) =>
    request("POST", "brounche/resource/selAllProjectsOnWx", data),
  selMediaApps: (data) =>
    request("POST", "brounche/resource/selMediaApps", data),
    selBasePicList: (data) =>
    request("POST", "brounche/resource/selBasePicList", data)

};
module.exports = {
  API,
};
