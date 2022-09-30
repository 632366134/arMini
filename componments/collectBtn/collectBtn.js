// componments/collectBtn/collectBtn.js
var app = getApp();
Component({
    /**
     * 组件的属性列表
     */
    properties: {

    },

    /**
     * 组件的初始数据
     */
    data: {
        isIPhoneX: app.isIPhoneX,
    },

    /**
     * 组件的方法列表
     */
    methods: {
        mytap(){
            this.triggerEvent('mytap')
        }
    }
})
