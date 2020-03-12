//访问用户主页时的入口文件，返回文件名。
//需要显示得job有三种情况：
//1 在waiting list 里，准备运行，但是还没有运行的。
//2 在taskList 里，正在运行，可能还没有开始。
//3 已经运行完了或者正在运行，存在predict_predicted_num.txt,并且 num==100 不等于一百的也不是。 可以先不加这个条件，因为这个情况太少了。
//  其他情况均是job不存在。
const fs = require( 'fs' );
const path = require('path');
const deleteFile = require("../middlewares/deleteFile"); //把只上传数据，但是没有实际运行的job删掉。
var checkmodule = require('../middlewares/checkRunning.js');
let waitinglist = checkmodule.getwaitingList();
let taskList = checkmodule.gettaskList();

function inwaiting(userId,jobId){
    let flag = false;
    for(let e of waitinglist){
        if(e.userId === userId && e.time == jobId){
           flag = true;
           break;
    }
    }
    
    //console.log("inwaitingflag:"+flag);
    return flag;
}

function intask(userId,jobId)
{
    let flag = false;
    for(var key in taskList)
    {
        if(key.split("/")[2] == userId && jobId == key.split("/")[3])
        {
            flag = true;
            break;
        }
     }
     //console.log("intaskflag:"+flag);
     return flag        
}
var fn_load = async(ctx, next) => {

	//var email = ctx.request.body.email || 'common'; //jiakang
    var userId = ctx.request.body.userId;//my
    var states;
    var runstatus="waiting";
    var seqNum = 0;
    //console.log('userId in loadJob.js is ',userId)
	if(userId !="")
    {
       var url = `users/upload-files/${userId}/`;
       var userFiles = {};
       userFiles["jobId"]=[];
       userFiles["jobStatus"]=[];
       userFiles["jobSeqnum"]=[];
       if(fs.existsSync(url)){
           files = fs.readdirSync(url); //这里的files 都是这个用户提交的job文件夹名字。
       	   files.forEach((file, index) => {
             //console.log("file:"+file+" exists");
       	     if(file !== 'blast')
             {//只显示成功submit的job,在三种情况之一的都可以。
                if(fs.existsSync(path.join(url,file,"/prediction_predicted_num.txt"))||inwaiting(userId,file)||intask(userId,file))
                {  
                   if(fs.existsSync(path.join(url,file,"/prediction_predicted_num.txt")))
                   {
                       states=fs.readFileSync(path.join(url,file,"/prediction_predicted_num.txt")).toString();
                       //console.log(states)
                       states = states.split(/[\r\n]+/)[0].split(":")[1];
                       //console.log(states)
                       if(states=="100")
                       {
                           runstatus="completed";
                       }else{runstatus="running"}
                   }
                   if(inwaiting(userId,file))
                   {
                      runstatus="waiting";
                   }
                   if(intask(userId,file))
                   {
                       runstatus="running"
                   }
                   //console.log("Job "+file+"can be shown")//file is the time folder not the file!
                   if(fs.existsSync(path.join(url,file,"/seq_num.txt")))
                   {
                    seqNum=fs.readFileSync(path.join(url,file,"/seq_num.txt")).toString();
                   }
                   userFiles["jobId"].push(file)
                   userFiles["jobStatus"].push(runstatus);
                   userFiles["jobSeqnum"].push(seqNum);
                   
       	        }
                else{
                    //下面这个再也不会出现了，在uploadpredict里上传文件，所以mkdir的同时，生成prediction_predicted_num 并且submit。
                   //console.log("file "+url+"/"+file+" is not submitted so delete!");
                   //deleteFile(path.join(url,file)); //注意 这个是真的删除了！！！！如果用户开了一个upload界面，同时查看history，因为upload的job没有提交，所以，就会报错啊！
                 }
               }
       	})
       }
       ctx.response.body = userFiles;
    }
}

module.exports = {
	'POST /loadJob': fn_load
};