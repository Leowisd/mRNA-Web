//执行blast
const fs = require("fs");
const path = require("path");
const exec = require('child_process').exec;

async function ProcessBlast(cmdStr2, cmdStr3,filePath,options){
  return await helper(cmdStr2, cmdStr3,filePath,options);
}

function helper(cmdStr2, cmdStr3,filePath,options){
  let res = [];

  function cmd2(){ 
    return new Promise((resolve, reject) => {
      exec(cmdStr2, (error, stdout) => {
        console.log(cmdStr2)
        if (error) {
          console.log(`exec error: ${error}`);
          reject();
        }    
        else {
          console.log(22)
          resolve(2);
        }
      })
    })
  }

  function cmd3(){ 
    return new Promise((resolve, reject) => {
      exec(cmdStr3, (error, stdout) => {
        console.log(cmdStr3)
        console.log(stdout)
        if (error) {
          console.log(`exec error: ${error}`);
          reject();
        }    
        else {
          console.log(33)
          resolve(3);
        }
      })
    })
  }
  
  
  function read1(){ 
    return new Promise((resolve, reject) => {
      fs.readFile(filePath + 'blast_output.txt', 'utf-8', (err, data) => {
        if(err) {
          console.log(err);
          resolve('error')
        }
        else{
          res.push(data);
          resolve(res)
        }
      })    
    })
  }

  function read2(){ 
    return new Promise((resolve, reject) => {
      let finalData = {};
      let filesDir = fs.readdirSync(filePath);
      /* for multiple annotations use this
      filesDir.forEach(file => {
        if(file !== 'blast_output.txt' && file !== 'sequence.fasta' && file !== 'format11.asn' &&file !='format6.txt' && file !='format2.txt'){
          let finalPath = path.join(filePath, file);
          let data = fs.readFileSync(finalPath, 'utf-8');
          finalData += data;
        }
      })
       */
      //console.log(options);
      options = options.replace( /"/g, '' );
      //console.log(options);
      let optionlist = options.split("_");
      //console.log(optionlist);
      for(let i=0;i<optionlist.length;i++){
          //console.log(path.join(filePath, optionlist[i]+".txt"));
          let data = fs.readFileSync(path.join(filePath, optionlist[i]+".txt"), 'utf-8');
          finalData[optionlist[i]] = data;
      }
      //console.log(finalData);
      res.push(finalData);
      resolve(res)
    })
  }
  
  //依次执行命令，包括blast的各种命令和读取结果，出现错误则返回fail
  return cmd2().then(cmd3).then(read1).then(read2).catch(err => {
    console.log('blastfail')
    return 'fail';
  }
  
  )
}

module.exports = ProcessBlast;
