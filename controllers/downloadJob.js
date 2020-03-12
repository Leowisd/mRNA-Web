//用户下载的入口文件，根据用户的输入生成各种参数，然后调用中间件downloadFile执行命令并把文件作为附件发送到浏览器端
const fs = require( 'fs' );
const path = require('path');
const send = require('koa-send');
const downloadFile = require("../middlewares/downloadFile");

var fn_download = async(ctx, next) => {
  	let username = ctx.request.body.userId || 'common';
  	let fileName = ctx.request.body.fileName || 'Phosphotyrosine';
  	let fileType = ctx.request.body.fileType || 'ptm';
  	//fileName.replace('\/', '');

	let path = await downloadFile(fileType, fileName, username);

	if(fileType === 'upload-files'){
		let list = [];
		let files = fs.readdirSync(path);
		let res = new Promise((resolve, reject) =>{
			files.forEach(e => {
				fs.readFile(path + e, 'utf-8', (err, data) => {
					if(err) {
						console.log(err);
					}
					else{
						let file = {};
						file.name = e;
						file.data = data;
						list.push(file);
						//console.log(list.length);
						if(list.length === files.length) resolve(list);
					}
				})			
			})	

		})
		ctx.response.body = await res;
	}
    else if(fileType === 'ptm'){
		let list = [];
		let res = new Promise((resolve, reject) =>{
				fs.readFile(path, 'utf-8', (err, data) => {
					if(err) {
						//console.log(err);
					}
					else{
						let file = {};
						file.name = fileName;
						file.data = data;
						list.push(file);
						//console.log(list.length);
						resolve(list);
					}
				})
		})
		ctx.response.body = await res;
	}
	else{
		ctx.attachment(path);
		await send(ctx, path);
	}
}

module.exports = {
	'POST /download': fn_download
};