//编译
class Compile{
    constructor(el,vm){
        this.$el = el;
        this.$vm = vm;

        if(this.$el){
            //1、获取到App下面所有的节点
            this.$Fragment = this.getNodeFragment(this.$el);
            //2、进行编译
            this.compile(this.$Fragment);
            //3、将编译好的节点插入app
            this.$el.appendChild(this.$Fragment)
        }
    }
    getNodeFragment(root){
        //创建文件碎片
        var frag = document.createDocumentFragment();

        var child;
        while(child = root.firstChild){
            //将节点保存在了js的内存当中，页面上就不会有这个节点了
            frag.appendChild(child);
        }
        return frag;
    }
    compile(fragment){
        var childNodes = fragment.childNodes;
        //遍历所有的子节点
        Array.from(childNodes).forEach((node)=>{
            //判断文本节点
             if(this.isText(node)){
                //文本节点的编译
                this.compileText(node)
                
             }
             //判断元素节点
            if(this.isElement(node)){
                //获取到当前节点身上所有的属性
                var attrs = node.attributes;

                Array.from(attrs).forEach((attr)=>{
                    var key = attr.name;
                    var value = attr.value;

                   
                    //判断是否是指令
                    if(this.isDirective(key)){
                        //获取指令名称
                        var dir = key.substr(2);
                        //调用指令对应的函数
                        this[dir+"update"] && this[dir+'update'](node,this.$vm[value]);
                    }

                    //判断是否是事件
                    if(this.isEvent(key)){
                        var dir = key.substr(1);
                        this.handleEvent(node,this.$vm,value,dir)
                    }
                })

             }

            


            //如果子节点下面还有子节点那么就进行递归
            if(node.childNodes && node.childNodes.length>0){
                this.compile(node)
            }
        })
    }
    isText(node){
        //判断文本节点 并且文本节点中必须要有{{内容}}
        return node.nodeType ===3 && /\{\{(.+)\}\}/.test(node.textContent);
    }
    isElement(node){
        //判断元素节点
        return node.nodeType === 1;
    }
    compileText(node){
        
       this.update(node,this.$vm,RegExp.$1,'text') 
        // console.log(RegExp.$1)
       /*
            node      元素
            this.vm  vue的实例
            RegExp.$1   {{属性}}
            text      标识
       */
    }
    //更新
    update(node,vm,exp,dir){
        var updateFn = this[dir+"update"];
        updateFn&& updateFn(node,vm[exp]);

        new watcher(node,vm,exp,(value)=>{
            updateFn&& updateFn(node,vm[exp]);
        })

    }
    textupdate(node,value){
        node.textContent = value;
    }
    //判断指令
    isDirective(attr){
        return attr.indexOf("v-") === 0;
    }
    //判断事件
    isEvent(attr){
        return attr.indexOf("@") === 0;
    }
    //事件处理
    handleEvent(node,vm,callback,type){
        // console.log(callback)
        //判断methods是否存在  以及callback函数是否在methods中  如果存在则进行绑定
        var fn = vm.$options.methods &&  vm.$options.methods[callback];
        node.addEventListener(type,fn.bind(vm));
    }
}