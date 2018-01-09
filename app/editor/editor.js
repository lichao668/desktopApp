let data = {
    content: "",
    fileName: '',
    checkedFile: false,
    checkedDB: false,
    showSaveAlert: false
}
const {
    BrowserWindow
} = require('electron').remote;
let preivewWindow = null;

const Editor = {
    template: ` 
        <div class="editor">
            <textarea class='linenum' readonly>1</textarea>
            <textarea class='mdInput' autofocus   @keyup='onkeyupClick' v-model='content' name="" id=""></textarea>
            
            <div class="tool">
             <a href="javascript:"  class='previewTool' @click='previewClick'  title='预览'><span></span></a>
             <a href="javascript:"  class='saveTool' @click='saveFileClick'><span></span></a>
             <span class='count'>{{content.length}}</span>
            <transition name="slide-fade">
                <form class='saveAlert' @submit.prevent='saveAlertSubmitClick' v-if='showSaveAlert'>
                    <h4 class='saveAlertTitle'>输入文件名称/标题</h4>
                    <div class='inputBox'>
                        <textarea @keyup='saveTitleKeyupClick' class='inputDefault' name='fileName' v-model='fileName' placeholder='请输入...'></textarea>
                        <div class='prompt'>{{fileName.length}}<span>/30</span></div>
                        <a href='javascript:' @click='titleClearClick' class='textareaClearBtn'></a>
                    </div>
                    
                    <div class='check'>
                        <label class="checkbox-inline">
                            <input type="checkbox" class='selectFile'   value="option1" v-model='checkedFile'>存文件
                        </label>
                        <label class="checkbox-inline">
                            <input type="checkbox" class="selectDb" value="option1" v-model='checkedDB'>存数据库
                        </label>
                    </div>
                    <div class='btns'>
                        <button class='confirmBtn' type='submit'>确定</button>
                        <button class='cancelBtn' type='button' @click.stop='cancelSaveAlertClick'>取消</button>
                    </div>
                </form>
            </transition>
            </div>
      
        </div>
       `,
    data: function () {
        return data;
    },
    methods: {
        titleClearClick: function () {
            this.fileName = '';
        },
        saveTitleKeyupClick: function () {
            if (30 <= this.fileName.length) {
                this.fileName = this.fileName.substr(0, 30);
            }
        },
        onkeyupClick: function () { //文本或有输入
            let mdInput = document.querySelector(".editor>textarea.mdInput");
            let linenum = document.querySelector(".editor>textarea.linenum");
            // 文本域高度随内容增高
            // if (mdInput.offsetHeight < mdInput.scrollHeight) {
            mdInput.style.height = "auto";
            mdInput.style.height = mdInput.scrollHeight + "px";
            // }
            //如果输入宽度小于滚动度就重新设置输入宽度 
            // if (mdInput.offsetWidth < mdInput.scrollWidth) {
            mdInput.style.width = "auto";
            mdInput.style.width = mdInput.scrollWidth + "px";
            // }
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
                preivewWindow = new BrowserWindow({
                    width: 800,
                    height: 600,
                    title: '预览'
                });
                preivewWindow.on('closed', function () {
                    preivewWindow = null;
                });
            }
            preivewWindow.show();
            let db = openDatabase('mydb', '1.0', '这是一个测试数据库', 2 * 1024 * 1024);
            db.transaction(function (tx) {
                tx.executeSql('SELECT * FROM mdFile', [], function (tx, results) {
                    var len = results.rows.length,
                        i;

                    for (i = 0; i < len; i++) {
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
            let input = document.querySelector('.saveAlert>.inputBox>textarea');
            input.style.borderColor = '#ccc';
        },
        saveAlertSubmitClick: function () {
            if ('' === this.fileName) {
                let input = document.querySelector('.saveAlert>.inputBox>textarea');
                input.setAttribute('class', 'inputDefault hasErr');
                return;
            } else if (!this.checkedDB && !this.checkedFile) {
                let cc = document.querySelector('.saveAlert>.check');
                cc.setAttribute('class', 'check hasErr');
                return;
            }
            // 存数据库
            if (this.checkedDB) {
                saveDB(this.fileName, this.content);
            }
            // 存文件
            if (this.checkedFile) {
                const fs = require('fs');
                const path = require('path');
                let workspacePath = path.join(__dirname, '../../workspace');
                try {
                    fs.mkdirSync(dirPath);
                } catch (error) {
                    console.log('文件夹存在');
                }
                let newFilePath = path.join(workspacePath, this.fileName + ".md");
                fs.writeFile(newFilePath, this.content, (err) => {
                    if (err) {
                        console.log('文件写入失败');
                    }
                    console.log('文件写入成功')
                });
            }


            this.showSaveAlert = false; //关闭弹窗
            // 清空输入项
            this.fileName = '';
            this.checkedDB = this.checkedFile = false;
        }

    },
    mounted: function () {
        // 当页面重新进入时重新设置输入区域的宽和高。
        this.onkeyupClick();
    }
};


function saveDB(title, content) {
    let db = openDatabase('mydb', '1.0', '这是一个测试数据库', 1024 * 1024 * 1024);
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS mdFile (id integer NOT NULL PRIMARY KEY AUTOINCREMENT, title,fileContent,createTime,updataTime)');

        db.transaction(function (tx) {
            tx.executeSql('SELECT count(id) FROM mdFile', [], function (tx, results) {
                console.log(results.rows[0])
            }, null);
        });

        tx.executeSql('INSERT INTO mdFile (title,fileContent,createTime,updataTime) VALUES (?,?,?,?)', [title, content, getTime(), getTime()]);
    });
}

function getTime() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes()
    minutes = minutes < 10 ? '0' + minutes : minutes;
    hours = hours < 10 ? '0' + hours : hours;
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${hours}:${minutes}`;
}

// 将组件导出
module.exports = {
    Editor
}