const baseUrl = 'https://wxminiapp.arsnowslide.com/';
function request(method, url, data) {
	return new Promise((resolve, reject) => {
		let header = {
		    'content-type': 'application/json' 
        };

		wx.request({
			url: baseUrl + url,
			method: method,
			header: header,
			data: method === 'POST' ? JSON.stringify(data) : data,
			success: (res) => {
				if(res.data.code === 1000){
					resolve(res.data.data);
				} else {
					reject(res);
				}
			},
			fail: (err) => {
				reject(err);
			}
		})
	})
}
const API = {
	selProjects: (data) => request('POST', 'wxMiniAppWeb/resource/selProjects', data),

	
};
module.exports = {
	API
}