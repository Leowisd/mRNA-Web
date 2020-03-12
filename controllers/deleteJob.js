//用户删除文件的入口文件，根据用户输入生成参数并调用deleteFile执行删除命令
var fs = require( 'fs' );
const path = require('path');
const deleteFile = require("../middlewares/deleteFile");
var checkmodule = require('../middlewares/checkRunning.js');
//删除job的同时，要把后台的在waitinglist里的job同时删掉比较好。
let waitinglist = checkmodule.getwaitingList();

var fn_delete = async(ctx, next) => {

  	let username = ctx.request.body.userId;
  	let fileName = ctx.request.body.fileName;
	let url = `users/upload-files/${username}/${fileName}`;
    for( var i = 0; i < waitinglist.length; i++){ 
      //console.log("in waitinglist ##########"+waitinglist[i].userId+" "+waitinglist[i].time);
      if ( waitinglist[i].userId === username&& waitinglist[i].time == fileName) {
           //console.log("deletting "+url);
           waitinglist.splice(i, 1); 
           i--;
          }
    }
	let res = await deleteFile(url);
	//console.log(res);
	ctx.response.body = res;
}

module.exports = {
	'POST /delete': fn_delete
};