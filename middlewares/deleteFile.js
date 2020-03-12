//删除文件或文件夹
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");

async function deleteFile(url){
	return await helper(url);
}

function helper(url){
	let stat = fs.statSync(url);
	return new Promise((resolve, reject) => {
		if(stat.isDirectory()){
			rimraf(url, err => {
				if(err){
					resolve(err)
				}
				else {
					resolve("Delete directory successfully", url);
				}
			})
		}
		else{
			fs.unlink(url, err => {
				if(err){
					resolve(err);
				}
				else {
					resolve("Delete file successfully", url);
				}
			})
		}
	})

}

module.exports = deleteFile;