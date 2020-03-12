//执行深度学习进行预测
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;

function ProcessDPonlysubmit(cmdStr, inputFileUrl, outputFileUrl){
	return helper(cmdStr, inputFileUrl, outputFileUrl);
}

function helper(cmdStr, inputFileUrl, outputFileUrl){
	//let res = [];
	exec(cmdStr, (error, stdout, stderr) => {
	if (error) {
    		console.log(`exec error: ${error}`);
  	}
  	else {
        //submit 成功运行完了，只会把处理数据的个数写入文件，并不返回任何,出错了不管。。。。
        fs.readFile(inputFileUrl, 'utf-8', (err, data) => {
        if(!err){
           let num_protein=data.toString().split(">").length - 1;
           let num_sites=0;
           let lines = data.toString().split("\n");
           let i;
           for(i=0;i< lines.length;i++)
           {
           if(lines[i].charAt(0) != '>')
           {num_sites+=lines[i].length}
           }
           //console.log("uploaded protein and sites "+num_protein+" "+num_sites);
           let content = fs.readFileSync('static/visitors/processed_protein_record.txt').toString().split("\n");
           //console.log("in static file contains protein and sites "+content[0]+" "+content[1]);
           num_protein=Number(content[0])+num_protein;
           num_sites=Number(content[1])+num_sites;
           //console.log("total protein and sites "+num_protein+" "+num_sites);
           fs.writeFileSync('static/visitors/processed_protein_record.txt', num_protein+"\n"+num_sites);
        }
        })
        //下面这些返回都没有用了，因为前台已经接受到submitted就不会在接受了。
  		//res.push("jobfinished");
  	}
	});
}

module.exports = ProcessDPonlysubmit;