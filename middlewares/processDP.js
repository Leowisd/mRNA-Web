//执行深度学习进行预测
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;

async function ProcessDP(cmdStr, inputFileUrl, outputFileUrl){
	return await helper(cmdStr, inputFileUrl, outputFileUrl);
}

function helper(cmdStr, inputFileUrl, outputFileUrl){
	let res = [];
	return new Promise((resolve, reject) => {
		exec(cmdStr, (error, stdout, stderr) => {
		if (error) {
    			console.log(`exec error: ${error}`);
    			reject('error');
  		}
  		else {
  			fs.readFile(inputFileUrl, 'utf-8', (err, data) => {
					if (err) {
						console.log(err);
						reject('error')
					} 
					else {
						res.push(data)
                        //每次processDP 后 都把下面这些写入文件
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
						fs.readFile(outputFileUrl, 'utf-8', (err, outputdata) => {
							if(err) {
								console.log(err);
								resolve('error')
							}
							else{
								res.push(outputdata);
                                res.push(num_protein)
                                res.push(num_sites)
								resolve(res)
							}
						})
					}
				});
  		}
		});
	})
}

module.exports = ProcessDP;