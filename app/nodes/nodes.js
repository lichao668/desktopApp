const fs = require('fs');
const path = require('path');
const marked = require('marked');

let workspacePath = path.join(__dirname, '../../workspace');

let data = {
    files: [],
    show:true,
}


const Nodes = {
    template: `
<div id='nodes'>
<transition name="slide-fade2">
    <div class='nodeList' v-if='show'>
        <div class='local'>
            <h3>本地笔记</h3>
            <ul>
                <li v-for='file in files'><a href='javascript:' @click.stop='readFileClick($event)'>{{file}}</a></li>
            </ul>
        </div>
        <div class='online'>
            <h3>在线笔记</h3>
            <ul>
                <li v-for='file in files'><a href='javascript:' @click.stop='readFileClick($event)'>{{file}}</a></li>
            </ul>
        </div>
    </div>
</transition>
<transition name="fade">
    <div class='previewBox'  v-if='!show'>
        <span class='close' @click='backClick'></span>
        <div class='preview' ></div>
    </div>
</transition>
    
</div>`,
    methods: {
        readFileClick:function(ev){
            this.show = false;
            let filePath = path.join(workspacePath,ev.target.innerText);
            fs.readFile(filePath,'UTF-8',(err,data)=>{
                if(err)
                    console.log('读取文件失败');
                let preview = document.querySelector('#nodes .preview');
                preview.innerHTML = marked(data);
            });
        },
        backClick:function(){
            this.show = true;
        }
    },
    data: function () {
        return data;
    },
    beforeCreate: function () {
        fs.readdir(workspacePath, (err, files) => {
            if (err)
                console.log('读取workspace失败');
            console.log(files)

            data.files = files;
        });
    }
};
// 将组件导出
module.exports = {
    Nodes
}