// componments/collectList.js
Component({
    /**
     * 组件的属性列表
     */
    externalClasses: ['url'],
    properties: {
        list: {
            type: Array,
            value: [],
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

        select_box(e) {
            console.log(e.currentTarget.dataset.item)
            this.setData({
              listIndex:e.currentTarget.dataset.item.id
            });
            this.triggerEvent('myevent',e.currentTarget.dataset.item)
          },
    }
})
