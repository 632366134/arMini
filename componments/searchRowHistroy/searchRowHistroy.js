// componments/searchRowHistroy/searchRowHistroy.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    compList: {
      type: Array,
      default: [],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    goSearch() {
      this.triggerEvent("myevent1");
    },
    goSearch2(item) {
      this.triggerEvent("myevent2",item);
    },
    bindKeyInput(e) {
      this.triggerEvent("myKeyinput",e);
    },
  },
});
