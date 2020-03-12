//上传文件时的入口文件，根据用户的输入生成参数，然后依次调用processDP执行命令，sendEmail发送邮件
const inspect = require('util').inspect;
const path = require('path');
const os = require('os');
const fs = require('fs');
const Busboy = require('busboy');
const asyncBusboy = require('async-busboy');
const exec = require('child_process').exec;
const sendEmail = require("../middlewares/sendEmail");
const processDP = require("../middlewares/processDP");

let taskList = [];
let waitingList = [];

//创建文件夹
function mkdirsSync( dirname ) {
  if (fs.existsSync( dirname )) {
    return true
  } else {
    if (mkdirsSync( path.dirname(dirname)) ) {
      fs.mkdirSync( dirname )
      return true
    }
  }
}


async function uploadFile( ctx, values, options) {
  
  //得到前端传来的内容并赋值给变量,busboy是一个用来解析前端form表单的工具
  const {files, fields} = await asyncBusboy(ctx.req);
  let time = fields["time"];
  let userId = fields["userId"];
  //console.log(files[0])
  let tmpPath = files[0]["path"]; //真正需要读取的文件名。
  //let fileName = time + ".fasta"; //jiakang 这个fileName 是用于存这个upload的file的，因为job是以时间区分的，不是文件名字。用户可能上传同名文件
  //let fileName = files[0]['filename'] //my
  let fileName = "input.fasta";
  let numName = "seq_num.txt";
  values["time"] = time;
  values["userId"] = userId;
  values["inputFile"] = fileName;
    
  let busboy = new Busboy({headers: ctx.req.headers});
    
  //let fileType = userId;
  let filePath = path.join( options.path, userId, time); //jiakang
  //let filePath = path.join( options.path, userId) //my
    
  //把文件写入用户目录下
  function p(){
    return new Promise((resolve, reject) => {
      //console.log('文件上传中...')
      let result = { 
        success: false,
        fasta:true,
        duplicate:false
      }
      fs.readFile(tmpPath, 'utf-8', (err, data) => {
        if(err) {
          console.log(err);
          reject(err);
        }
        else{
          if(data.charAt(0) !=">")
          {
              //console.log("fast failed 1");
              result['fasta']=false;
          }
          let inputs = data.split(/[\r\n]+\>/); //for linux files this is \r not \n
          let title;
          let titlehash = new Object();
          //console.log("inputs in processCheck_Data"+inputs)
          let len = inputs.length;//how many sequences
          let processeddata = "";
          //console.log(inputs);
          let j=0;
          
          for(let e of inputs){
            //e = e.replace( /,/g, '' );
            e = e.split(/[\n\r]+/);
            title=e[0];//第一个一定是id
            if(j==0)
            {
                title = title.slice(1); //the first title contains > need to be removed
            }
            if(titlehash.hasOwnProperty(title)){
                //console.log("duplicate id are found!");
                result["duplicate"]=true;
                //return 1; //duplicate id error
            }else{
                titlehash[title]=1;
            }
            e.shift(0);//这个是id要去掉
            if(e[e.length - 1] === ''){
              e.pop();//如果最后一个是空也要去掉
            }
            e = e.join('').replace(/\s+/g,''); //去掉sequence间所有可能的空格
            //console.log("current e in processCheck_Data is"+e)
            if(e.match(/^[a-zA-Z-\*]+$/)==null)
            {
                //console.log("fasta failed 2");
                result['fasta']=false;
                //return 0;
            }
            //console.log("title is "+title)
            processeddata+=">"+title+"\n"+e.toUpperCase()+"\n";
            j++;
          }
          
          //console.log("data is "+processeddata);
          if(result['duplicate'] ==false && result['fasta'] == true)
          {
          console.log("upload file to "+`${filePath}/${fileName}`)
          let mkdirResult = mkdirsSync( filePath ); //如果在没有成功时就建立文件夹是错误的！！！ 只有成功了才可以建立文件夹
          fs.writeFileSync(`${filePath}/${fileName}`, processeddata);
          fs.writeFileSync(`${filePath}/${numName}`,len);//把sequence 的个数也写入文件夹。
          result["success"] = true;
          }
          //console.log("result_fasta is"+result["fasta"]);
          resolve(result);
        }
      })
    })
  }
    
  return p(); 
} 

//返回用户正在进行的任务数量
function checkUserFileAmount(userId){
  let count = 0;
  taskList.forEach(e => {
    if(e.userId === userId){
      count ++;
    }
  })
  waitingList.forEach( e => {
    if(e.userId === userId){
      count ++;
    }
  })
  return count;
}


//这个函数最先被触发
let fn_upload =  async(ctx, next) => {
  let values = {
    inputFile: "",
    userId: "common",
    time: ""
  }
  let outputFile;
  let res = [];
  
  if ( ctx.url === '/upload' && ctx.method === 'POST' ) {
      
      let result = { success: false }
      let serverFilePath = path.join( 'users/', 'upload-files' )
      
      // upload file values from main.js onDrop function
      result = await uploadFile( ctx, values,
        {
          path: serverFilePath
        }
      )
      ctx.body = result
    } 
    else {
      ctx.body = '<h1>404！！！ o(╯□╰)o</h1>'
    }
    
}




module.exports = {
    'POST /upload': fn_upload
}