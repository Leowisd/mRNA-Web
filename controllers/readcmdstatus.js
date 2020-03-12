//用户粘贴数据开始运行时，调用这个查看运行进度条。
const fs = require( 'fs' );
const path = require('path');

var fn_read = async(ctx, next) => {
	let data = ctx.request.body.input;
	let userId = ctx.request.body.userId;
	let time = ctx.request.body.time;
    let resultstatus = "prediction_predicted_num.txt";
    //let res = [];
    let output = new Promise(function(resolve, reject){
        fs.readFile(`users/upload-files/${userId}/${time}/${resultstatus}`, 'utf-8', function (err, data) {
                          if(err) {
                          //console.log(err);
                          //reject(err);
                          resolve("nostatus");//没有得到status结果
                          }
                          else{
                          //res.push(data);
                          //console.log('read result status successfully')
                          resolve(data)
                        }
                      });
                  });
      ctx.response.body = await output;
    };

module.exports = {
	'POST /readcmdstatus': fn_read
};