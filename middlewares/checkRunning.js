//查看当前系统的运行job状态，并安排taskList 与 waitingList，由app.js调用
const processDPonlysubmit = require("./processDPonlysubmit");
const exec = require('child_process').exec;

let waitingList = []; //这里放所有的item,由用户改变。
let runNum = 0; 
let  taskList= new Object();//inputUrl 由系统查询得到，用户可以加。
let maxCapacity = 3;//可以同时执行的任务个数。因为upload文件会比较大，所以这里只限制可以同时执行3个upload任务
//把等待队列中的第一个任务放入执行队列中 能调用这个说明已经runNum < maxCapacity了,并要求运行。

function recurseList(){
    //push the first task in waitingList to taskList and process it 
    if(waitingList.length > 0){
      let task = waitingList[0];
      //为了防止，waiting->submit 状态下tasklist需要等待3秒的询问才更新的情况，提前在移除waiting前就把taskList填好。
      taskList[task.inputFileUrl]=1;
      //console.log("add one job from waiting to tasklist, tasklist added to "+Object.keys(taskList).length);
      waitingList.shift(0);
      //console.log("waitingList deleted to "+waitingList.length);
      //这个只是submit不需要返回任何。
      processDPonlysubmit(task.cmdStr, task.inputFileUrl, task.outputFileUrl);
      
    }
}

function helper(url, maxAge){
        
         //let cmdStr = `python3 musiteDeepCapsnet/predict_batch.py -input ${inputFileUrl} -output users/upload-files/${userId}/${time}/${outputprefix} -model-prefix musiteDeepCapsnet/models/${model}/models/model`
         cmdStr=`ps -x|grep "python3 MusiteDeep"`;
         exec(cmdStr, (error, stdout, stderr) => {
         if(error)
         {  //希望不会出错，如果出错了，就把runNum设为0，当前没有运行的程序。以后也不会有太大问题。
            console.log(`exec error: ${error}`);
            runNum = 0; 
         }else{
            //console.log(`exec correct: ${stdout}`);
            //console.log(stdout)
            results = stdout.split("\n");
            //如果成功运行ps了，那么原来的taskList就需要清空，重新设置taskList
            for (var prop in taskList) {
              if (taskList.hasOwnProperty(prop)) {
              delete taskList[prop];
            }
            }
            
            for(let i=0;i<results.length;i++)
            {
              //console.log("results[0] = "+results[0]);
             //find 真实的程序
             if(results[i].search("predict_multi_batch.py") != -1)
             {
                 //console.log("find results = "+results[i]);
                 let inputUrl = results[i].split("predict_multi_batch.py")[1].split(/\s+/)[2];
                 //console.log("match "+inputUrl);
                 taskList[inputUrl]=1;
             }
            }
            
            
            //runNum = Number(${stdout});
            runNum = Object.keys(taskList).length;
            //console.log("current task number is "+runNum);
            //console.log("current waiting number is "+waitingList.length);
         }
         })
         
         if(Object.keys(taskList).length < maxCapacity)
         {
           //console.log("Object.keys(taskList).length is "+Object.keys(taskList).length);
           recurseList();
         }
}

function checkRunning(){
    //console.log("waitingList has "+waitingList.length+" jobs");
    //console.log("taskList has "+Object.keys(taskList).length+" jobs");
	if(waitingList.length>0 || Object.keys(taskList).length>0){ //有东西在等待，或者有东西在跑就要时刻监测后台，否则不需要。
    helper();
    }
	return async (ctx, next) => {
	//	await next();
	}
    //return 1;
}


getwaitingList = function()
{
    //console.log("len of waitingList in getwaitingList is"+waitingList.length);
    return waitingList;
} 


gettaskList = function()
{
    //console.log("len of gettaskList in gettaskList is"+taskList.length);
    return taskList;
} 

getmaxCapacity = function()
{
    //console.log("maxCapacity is"+maxCapacity);
    return maxCapacity;
} 



module.exports = {
    checkRunning:checkRunning,
    getwaitingList,
    gettaskList,
    getmaxCapacity,

}
