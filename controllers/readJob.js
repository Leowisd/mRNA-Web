//用户主页中点击show 会把该job输入输出传到浏览器端并展示，能调用到这步的是确定有output的。否则在readjobstatitics 就停止了。
const fs = require( 'fs' );
const path = require('path');

var fn_read = async(ctx, next) => {
    let userId = ctx.request.body.userId;
    let time = ctx.request.body.time;
    let inputFile =  "input.fasta";
    let outputFile =  "prediction_results.txt";
    let res = [];
    let output = new Promise(function(resolve, reject){
                fs.readFile(`users/upload-files/${userId}/${time}/${inputFile}`, 'utf-8', function (err, data) {
                  if (err) {
                      //console.log(err);
                      reject(err);
                  } else {
                    res.push(data)
                    //console.log('read input successfully')
                      fs.readFile(`users/upload-files/${userId}/${time}/${outputFile}`, 'utf-8', function (err, data) {
                        if(err) {
                          //console.log(err);
                          reject(err);
                        }
                        else{
                          res.push(data);
                          //console.log('read output successfully')
                          resolve(res)
                        }
                      })
                  }
              });
    });
      ctx.response.body = await output;
}

module.exports = {
	'POST /read': fn_read
};