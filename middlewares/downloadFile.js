//下载文件
const fs = require("fs");
const path = require("path");

async function downloadFile(fileType, fileName, username){
	return await helper(fileType, fileName, username);
}

function helper(fileType, fileName, username){
	let path;
	return new Promise((resolve, reject) => {
		switch(fileType){
			case "ptm":
				//console.log(fileName)
				path = `static/ptm/${fileName}`;
				resolve(path);
				break;
			case "upload-files":
				path = `users/upload-files/${username}/${fileName}/`;
				resolve(path);
				break;
		}
	})
}

module.exports = downloadFile;