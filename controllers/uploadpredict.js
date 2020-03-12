//上传文件时的入口文件，根据用户的输入生成参数，然后依次调用processDP执行命令，sendEmail发送邮件
const path = require('path');
const os = require('os');
const fs = require('fs');
const sendEmail = require("../middlewares/sendEmail");
const processDPonlysubmit = require("../middlewares/processDPonlysubmit");
const exec = require('child_process').exec;
var checkmodule = require('../middlewares/checkRunning.js');
let waitingList = checkmodule.getwaitingList();
let taskList = checkmodule.gettaskList();
let maxCapacity = checkmodule.getmaxCapacity();
const asyncBusboy = require('async-busboy');

//let taskList = [];
//let waitingList = []; 
let maxperson = 5;// 用户最大提交job个数可以比maxCapacity 大，因为maxCapacity是同时可执行的任务，用户可以多提交。这个是看waitlist里与正在执行的里面用户的总数。

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



//返回用户正在进行的任务数量,这里需要加一个，当用户主动删除时是不是要判断一下队列里的东西，把tasklist与waitinglist都空出来？ tasklist不要空了，因为已经开始跑了，
//不过可以把waitingList空出来，还没有开始跑的。需不需要加一个取消运行的机制？必须在运行当中才有取消的机制。
function checkUserFileAmount(userId){
  let count = 0;
  for(var key in taskList)
  {
    //console.log("taskList is "+key);
    if(key.split("/")[2] == userId)
    {count ++;}
  }
  //taskList.forEach(e => {
  //  if(e.userId === userId){
  //    count ++;
  //  }
  //})
  
  waitingList.forEach( e => {
    if(e.userId === userId){
      count ++;
    }
  })
  return count;
}


//这个函数最先被触发
let fn_predict =  async(ctx, next) => {
  //console.log("begin call current tasklist "+Object.keys(taskList).length);
  //console.log("begin call current waitingList "+waitingList.length);
  const {files, fields} = await asyncBusboy(ctx.req);
  //let userId = ctx.request.body.userId;
  //let models = ctx.request.body.model;//之前就要检查，确保model不是空！
  //let uploadcontent=ctx.request.body.uploadcontent;
  //let uploadSeqNum = ctx.request.body.uploadSeqNum;
  //let time = ctx.request.body.time;
  let userId =fields["userId"];
  //console.log(userId);
  let time = fields['time'];
  let uploadcontent = fields['uploadcontent'];
  //console.log(uploadcontent)
  let uploadSeqNum = fields['uploadSeqNum'];
  let modelOptions = JSON.parse(fields['modelOptions'])//{'models':models};
  //console.log(modelOptions)
  //console.log(modelOptions['models'])
  let model = modelOptions['models'][0].value;
  for(let i=1;i<modelOptions['models'].length;i++)
  {
        model+=";"+modelOptions['models'][i].value;
  }
  
  //let inputFile = time+".fasta";
  let inputFile = "input.fasta";
  //console.log(userId)
  //console.log(time)
  //console.log("save modelOptions into files");
  //console.log("to "+'users/upload-files/'+userId+"/"+time+"/modelOptions.json");
  //fs.writeFileSync('users/upload-files/'+userId+'/'+time+"/modelOptions.json", JSON.stringify(modelOptions));
  let res = [];
  //上传成功后根据用户的输入生成各种参数，准备执行blast
  //let outputprefix = time;
  let outputprefix = "prediction";
  let outputFile = outputprefix + '_results.txt';
  let inputFileUrl = `users/upload-files/${userId}/${time}/${inputFile}`; //jiakang
  let outputFileUrl = `users/upload-files/${userId}/${time}/${outputFile}`; //jiakang
  let numFileUrl =   `users/upload-files/${userId}/${time}/seq_num.txt`; //jiakang
  let stateFile = outputprefix+'_predicted_num.txt';
  
  //let inputFileUrl = `users/upload-files/${userId}/${inputFile}`;
  //let outputFileUrl = `users/upload-files/${userId}/${outputFile}`;
  //let cmdStr = `python3 musiteDeep/predict_batch.py -input ${inputFileUrl} -predict-type 'custom' -output users/upload-files/${userId}/${time}/${outputprefix} -model-prefix musiteDeep/models_2018-11-13/${model}`
  let cmdStr = `python3 mRNALoc/Multihead_predict.py --dataset ${inputFileUrl} --outputpath users/upload-files/${userId}/${time} --weights_dir mRNALoc/model/weights_fold_`
  //console.log(cmdStr);
  let item = {
    userId: userId,
    time: time,
    cmdStr: cmdStr,
    inputFileUrl: inputFileUrl,
    outputFileUrl: outputFileUrl
  }
  
  //查看用户在两个队列中的任务总数，超过maxperson则不予执行，返回amountError
  let count = checkUserFileAmount(userId);
  //console.log("user has already submitted "+count+" jobs some in tasklist some in waitingList");
  //console.log("current taskList has "+Object.keys(taskList).length);
  //console.log("current waitingList has "+waitingList.length);
  if(count >= maxperson){ //为了测试这里先改为30 如果大于这个，这个输入文件也不应该要了。应该也删除不要show了,改为这样就不upload，不需要删除了。
    //console.log("current waitingList num "+waitingList.length); //
    ctx.body = 'amountError';
  }else// 这里改了，只要可以上传，这个文件就要被建立了。
  {
  let mkdirResult = mkdirsSync( `users/upload-files/${userId}/${time}` ); //如果在没有成功时就建立文件夹是错误的！！！ 只有成功了才可以建立文件夹
  fs.writeFileSync(`${inputFileUrl}`, uploadcontent);
  fs.writeFileSync(`${numFileUrl}`,uploadSeqNum);//把sequence 的个数也写入文件夹。
  fs.writeFileSync('users/upload-files/'+userId+"/"+time+"/modelOptions.json", JSON.stringify(modelOptions));
  //先保证这个文件有，后面就不容易出错了。
  fs.writeFileSync(`users/upload-files/${userId}/${time}/${stateFile}`, "Start:0");
  //执行队列中还有空余则将该任务放入队列执行，每当执行队列中有任务执行结束则从等待队列中取一个任务放到执行队列中
  if(Object.keys(taskList).length < maxCapacity){
    //taskList.push(userId);
    taskList[inputFileUrl]=1;//这一步和checkRunning 不冲突，如果真的跑了，自然taskList也会有这个url，如果没有跑，这个taskList里也有这个url，当waitlist 有东西时，才把失败的清除。
    //console.log("tasklist<max, pushed "+item.inputFileUrl+" and tastlist added to "+Object.keys(taskList).length);
    //console.log("processing job "+inputFileUrl);
    //await bodyreturn(ctx,next); //go to body return 先return 再执行下面的
    //console.log("body return submitted")
    ctx.body = "submitted" //试验过了，想这个先返回，那么后面不能直接有await，但可以调用jobsubmit async function 里面有await可以。
    //console.log("before processDPonlysubmit")
    //let output = await processDPonlysubmit(cmdStr, inputFileUrl, outputFileUrl);
    //Jobsubmit(cmdStr, inputFileUrl, outputFileUrl,item);

    processDPonlysubmit(cmdStr, inputFileUrl, outputFileUrl);
    //ctx.body = await output;
    //ctx.body = 'jobfinished';
    //console.log("waitingList changed "+waitingList.length); //waitingList 是local的，但是是后台的全局的，后台先在内存中运行。
    //recurseList(item);
  }
  
  //执行队列已满则把该任务放入等待队列中
  else{
    waitingList.push(item);
    //console.log("current tasklist>=maxCapacity waitingList added to "+waitingList.length); //
    let len = waitingList.length;
    ctx.body = `Your job has been submitted, but there are ${len} people ahead of you. Please wait for your job to run.`;
  }
  
  }        
  
  //sendEmail(outputFile, outputFileUrl, userId);
}



getwaitingList = function()
{
    //console.log("len of waitingList in getwaitingList is"+waitingList.length);
    return waitingList;
} 

gettaskList = function()
{
    //console.log("len of gettaskList in gettaskList is"+Object.keys(taskList).length);
    return taskList;
} 
module.exports = {
    'POST /uploadpredict': fn_predict,
    //'POST /uploadpredict_check': predict_status_check,
    //getwaitingList
}

