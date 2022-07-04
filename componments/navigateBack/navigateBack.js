// componments/navigateBack/navigateBack.js
import {navigateBack} from '../../utils/navigate'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: {
        type:String,
        default:''
    },
    title3:{
        type:String,
        default:''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    back() {
      navigateBack(this.data.url);
    },
  },
});
