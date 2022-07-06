// componments/confirm/confirm.js
import { goTo } from "../../utils/navigate";

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        borchureDetail:{
            type:Object,
            default:{}
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
        exit(){
            this.triggerEvent('changeMask')
        },
        confirmAr(){
            wx.navigateTo({ url: 'plugin://kivicube-slam/scene?id=3c1b406e1c634503a99c6dac8063745d' })
            // goTo('slamPlugin')
        }
    }
})
