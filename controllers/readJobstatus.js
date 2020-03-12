//用户主页中点击show时，先检查该job的运行状态，返回对应的值。有jobnotexists，
//需要显示得job有三种情况：
//1 在waiting list 里，准备运行，但是还没有运行的。
//2 在taskList 里，正在运行，可能还没有开始。
//3 已经运行完了或者正在运行，存在predict_predicted_num.txt
//  其他情况均是job不存在。

const fs = require( 'fs' );
const path = require('path');
var checkmodule = require('../middlewares/checkRunning.js');
let waitinglist = checkmodule.getwaitingList();
let taskList = checkmodule.gettaskList();

var fn_read = async(ctx, next) => {
    let userId = ctx.request.body.userId;
    let time = ctx.request.body.time;
    let resultstatus = "prediction_predicted_num.txt";
    let inputfile = "input.fasta";
    let res = [];
    //console.log("waitinglist num "+waitinglist.length);
    
    let output = new Promise(function(resolve, reject){
        let inwaiting = -1;
        let intask = -1;
        for(let i=0;i<waitinglist.length;i++)
        {
           if(userId == waitinglist[i].userId && time == waitinglist[i].time)
           {
            inwaiting = i+1;
            break;
           }
        }
        
       for(var key in taskList)
       {
            //console.log("taskList is "+key);
           if(key.split("/")[2] == userId && time == key.split("/")[3])
           {
               intask = 1;
               break;
           }
        }
        //console.log("there are "+inwaiting+" jobs ahead of yours");//正在执行或者已经执行完的job 是-1 
        //console.log("your jobs intask  "+intask);//正在执行或者已经执行完的job 是-1 
        if(inwaiting ==-1){ //not in waiting list can be called.
            fs.readFile(`users/upload-files/${userId}/${time}/${resultstatus}`, 'utf-8', function (err, data) {
                if(err){
                        //console.log(err);            
                        if(intask == 1)
                        {
                            res.push("jobhasnotstart");
                            //console.log("jobhasnotstart");
                            resolve(res);
                        }else{
                            //这里出错还有可能是连输入都不存在，这时返回的应该不同。为了job的url,当input都删除时返回job不存在，当resultstatus不存在时，原因是job没有提交。
                            fs.readFile(`users/upload-files/${userId}/${time}/${inputfile}`, 'utf-8', function (err2, data) {
                            if(err2)
                            {
                            res.push("jobnotexists");
                            //console.log("jobnotexists");
                            resolve(res);
                            }else{
                            //reject(err);//input 存在，而 resultsstatus不存在，可能太快了，status没有生成，返回一个nostatus，前台如果几次后还是这个就停止。
                            res.push("nostatus");
                            resolve(res)
                            }
                            })
                        }
                    }
                    else{
                          res.push(data);
                          //console.log('read result status successfully with data'+data)
                          resolve(res)
                          }
                          }
                          )
            
        }else{
                //console.log("there are "+inwaiting+" jobs ahead of yours");
                res.push("inwaiting_"+inwaiting);
                resolve(res);
        }
        });
      ctx.response.body = await output;
    };

module.exports = {
	'POST /readJobstatus': fn_read
};