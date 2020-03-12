//执行blast
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;

async function ProcessBlastuserquery(cmdStr,outputFileUrl){
  return await helper(cmdStr,outputFileUrl);
}

function helper(cmdStr, outputFileUrl){
	let res = [];
	return new Promise((resolve, reject) => {
		exec(cmdStr, (error, stdout, stderr) => {
		    if (error) {
    	    		console.log(`exec error: ${error}`);
    	    		reject('error');
  		    }
  		    else {
  		    	 fs.readFile(outputFileUrl, 'utf-8', (err, outputdata) => {
		    	        if(err) {
		    		     console.log(err);
		    			 reject('error')
		    		    }
		    			else{
		    				res.push(outputdata);
		    				resolve(res);
		    			}
		    		})
		           }
		    });
  		})
}


module.exports = ProcessBlastuserquery;
