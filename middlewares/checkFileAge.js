//查看文件存在时间的入口文件，由app.js调用
const fs = require("fs");
const path = require("path");
const deleteFile = require("./deleteFile");

function helper(url, maxAge){
	let now = Date.now();

	//url exists or not
	if(fs.existsSync(url)){
		let usersDir = fs.readdirSync(url); //usersDir 里是所有的用户dir及common dir
		usersDir.forEach( (tasksDir, index) => {
            //console.log("tastksDir is" +tasksDir);
            let curPath = path.join(url, tasksDir); //tasksDir 就是每一个用户dir及common dir 及example dir
            if(tasksDir != 'example') //example 里面的东西时不删的。
            {
                if(tasksDir != 'common'){ //目录不是common 并且不是example，修改时间大于72h，并且里面没有东西，就把目录删掉。
                //console.log("tastksDir is not common" +curPath);
                let modifyData = new Date(fs.statSync(curPath).mtime);
				if(Number(modifyData) + maxAge < now && fs.readdirSync(curPath).length==0){
                    console.log("start delete userfolder", curPath);
                    (async () => {
					let b = await deleteFile(curPath);
					console.log(b);
					})();
                }
                }
                if(fs.existsSync(curPath))
                {
			         tasksDir = fs.readdirSync(curPath); //现在taskDir变为 common里面的dir以及用户dir里面的dir了。 只有这级目录里面的东西会被删掉。与common同级的目录不会被删掉。
			         tasksDir.forEach( task => {
			     	let finalPath = path.join(curPath, task);
			     	let stat = fs.statSync(finalPath);
			     	let creationDate = new Date(stat.birthtime);
                
			     	//check if file age exceeds max age
			     	if(Number(creationDate) + maxAge < now){
			     		console.log("start delete", finalPath);
                
			     		(async () => {
			     				let a = await deleteFile(finalPath);
			     				console.log(a);
			     		})();
			     	
			     	}
			        })
                }
            }
		} )
	}
}

function checkFileAge(url, maxAge){
	helper(url, maxAge);
	return async (ctx, next) => {
		await next();
	}
}

module.exports = checkFileAge;