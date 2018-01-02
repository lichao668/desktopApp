let data = { content: "", fileName: '', checkedFile: false, checkedDB: false, showSaveAlert: false }
const { BrowserWindow } = require('electron').remote;
let preivewWindow = null;

const Editor = {
    template:
        ` 
        <div class="editor">
            <div class="tool">
             <a href="javascript:"  class='previewTool' @click='previewClick'  title='预览'><span></span></a>
             <a href="javascript:"  class='saveTool' @click='saveFileClick'>
                <span></span>
             </a>
            <transition name="slide-fade">
            <form class='saveAlert' @submit.prevent='saveAlertSubmitClick' v-if='showSaveAlert'>
                    <h4 class='saveAlertTitle'>输入文件名称</h4>
                    <div class='inputBox'>
                        <label for="fileName">文件名：</label>
                        <input class='inputDefault' name='fileName' type='text' placeholder='请输入文件名称' v-model='fileName'>
                    </div>
                    <div class='check'>
                        <label class="checkbox-inline">
                            <input type="checkbox" class='selectFile'  value="option1" v-model='checkedFile'>存文件
                        </label>
                        <label class="checkbox-inline">
                            <input type="checkbox" class="selectDb" value="option1" v-model='checkedDB'>存数据库
                        </label>
                    </div>
                    <div class='btns'>
                        <button class='confirmBtn' type='submit'>确定</button>
                        <button class='cancelBtn' type='button' @click='cancelSaveAlertClick'>取消</button>
                    </div>
                </form>
                </transition>
             
            </div>
            <textarea class='linenum' readonly>1</textarea>
            <textarea class='mdInput' autofocus   @keyup='onkeyupClick' v-model='content' name="" id=""></textarea>

            
       </div>
       `
    , data: function () {
        return data;
    },
    methods: {
        onkeyupClick: function () { //文本或有输入
            let mdInput = document.querySelector(".editor>textarea.mdInput");
            let linenum = document.querySelector(".editor>textarea.linenum");
            let editor = document.querySelector(".editor");


            // 文本域高度随内容增高
            mdInput.style.height = "auto";
            mdInput.style.height = mdInput.scrollHeight + "px";
            //如果输入宽度小于滚动度就重新设置输入宽度 
            if (mdInput.offsetWidth < mdInput.scrollWidth) {
                mdInput.style.width = "auto";
                mdInput.style.width = mdInput.scrollWidth + "px";
            }
            linenum.style.height = 'auto';
            linenum.style.height = mdInput.scrollHeight + "px";
            // 获取当前输入的行数，设置行号
            let reg = /\n/ig;
            let num = 0;
            if (this.content.match(reg)) {
                num = this.content.match(reg).length;
            }
            let str = '';
            for (let i = 0; i <= num; i++) {
                str += `${i + 1}\n`;
            }
            linenum.value = str;
        },
        previewClick: function () { //预览
            //创建预览窗口
            if (preivewWindow == null) {
                preivewWindow = new BrowserWindow({ width: 800, height: 600, title: '预览' });
                preivewWindow.on('closed', function () {
                    preivewWindow = null;
                });
            }
            preivewWindow.show();
            let db = openDatabase('mydb', '1.0', '这是一个测试数据库', 2 * 1024 * 1024);
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM mdFile', [], function (tx, results) {
                   var len = results.rows.length, i;
                 
                   for (i = 0; i < len; i++){
                    console.log(results.rows.item(i));
                   }
                 
                }, null);
             });

        },
        saveFileClick: function () {
            this.showSaveAlert = !this.showSaveAlert;
        },
        cancelSaveAlertClick: function () {
            this.showSaveAlert = false;

            let input = document.querySelector('.saveAlert>.inputBox>input');
            input.style.borderColor = '#ccc';
        },
        saveAlertSubmitClick: function () {
            if ('' === this.fileName) {
                let input = document.querySelector('.saveAlert>.inputBox>input');
                input.setAttribute('class', 'inputDefault hasErr');
                return;
            } else if (!this.checkedDB && !this.checkedFile) {
                let cc = document.querySelector('.saveAlert>.check');
                cc.setAttribute('class', 'check hasErr');
                return;
            }
            if(this.checkedDB){
                saveDB(this.fileName,this.content);
            }else if(this.checkedFile){

            }else if(this.checkedDB && this.checkedFile){

            }
            

            this.showSaveAlert = false; //关闭弹窗
            // 清空输入项
            this.fileName = '';
            this.checkedDB = this.checkedFile = false;
        }



    }
};

function saveDB(fileName,content) {
    let db = openDatabase('mydb', '1.0', '这是一个测试数据库', 2 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS mdFile (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, fileName,fileContent,createTime,updataTime)');
        
        db.transaction(function (tx) {
            tx.executeSql('SELECT count(id) FROM mdFile', [], function (tx, results) {
               console.log(results.rows[0])
            }, null);
         });

        tx.executeSql('INSERT INTO mdFile (fileName,fileContent,createTime,updataTime) VALUES (?,?,?,?)',[fileName,content,'sdf','df']);
    });
}

// 将组件导出
module.exports = { Editor }





