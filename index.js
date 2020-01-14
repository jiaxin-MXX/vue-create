class AlleyVue{
    constructor(options){
        this.$options = options;
        //数据
        this.$data = options.data;
        //挂在点
        this.$el = document.querySelector(options.el);
        //数据劫持
        this.observer(this.$data);

        //进行编译
        new Compile(this.$el,this);
    }
    observer(data){
        //判断传入的data是不是一个对象
        if(!data || typeof data !=="object")return;

        //获取到data身上所有的key值进行遍历
        Object.keys(data).forEach(key=>{
            //给data身上所有的属性添加getter和setter方法
            this.defineRective(data,key,data[key]);
            //将data身上所有的属性复制一份到vm的实例身上
            this.proxyData(key);
        })
    }
    proxyData(key){
        Object.defineProperty(this,key,{
            get(){
                return this.$data[key];
            },
            set(newVal){
                this.$data[key] = newVal;
            }
        })
    }
    defineRective(data,key,val){
        //递归  检测data属性的值是否还是一个对象 如果是则在进行遍历
        this.observer(val);
        var dep = new Dep();

        //添加getter和setter方法
        Object.defineProperty(data,key,{
            get(){
                //依赖收集
                Dep.target && dep.addDep(Dep.target);

                //访问  
                return val;
            },
            set(newVal){
                //设置
                if(newVal == val)return;
                val = newVal;
                
                //当设置的时候我们只要做一次通知更新即可
                dep.notify();
            }
        })
    }
}



class Dep{
    constructor(){
        //存储所有的依赖
        this.deps = [];
    }
    addDep(dep){
        // console.log(dep)
        this.deps.push(dep);
    }
    notify(){
        
        this.deps.forEach((item)=>{
            item.update();
        })
    }
}


class watcher{
    constructor(node,vm,exp,cb){
        console.log(vm)
        this.$vm = vm;
        this.$exp = exp;
        this.cb = cb;

        Dep.target = this;
        this.$vm[this.$exp];//这一步是在做get的处罚  
        Dep.target = null;
    }
    update(){
        this.cb.call(this.$vm,this.$vm[this.$exp]);
    }

}
