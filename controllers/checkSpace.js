//查看已使用的空间大小，打开个人主页时被调用
const fs = require( 'fs' );
const path = require('path');

let fn_checkSpace = async(ctx, next) => {
  	//let username = ctx.request.body.username || 'common';
    let username = ctx.request.body.username;
  	let url = `users/upload-files/${username}`;
  	let space = 0;

  	function checkSpaceHelper(url){
		if(fs.existsSync(url)){
			//url exists or not
			files = fs.readdirSync(url);
			files.forEach( (file, index) => {
                if(file!=="blast")
                {
				let curPath = path.join(url, file);
				let stat = fs.statSync(curPath);
				//console.log(file)
				//if current path is a directory, recurse the function
				if(stat.isDirectory()){
					checkSpaceHelper(curPath);
				}
				//check if file age exceeds max age
				else{
					//let arr = file.split(".");
					//if(arr[arr.length - 1] === 'fasta')
                    //{
						space += stat.size / (1024 * 1024);
					//}
				}
			    }
                })
		}   		
  	}
	
	checkSpaceHelper(url);
	//console.log(space)
	//返回空间的两位小数
	ctx.response.body = space.toFixed(2);
	await next();
}

module.exports = {
	'POST /checkSpace': fn_checkSpace
};