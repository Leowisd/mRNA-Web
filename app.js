const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const router = require('koa-router')();
const controller = require('./middlewares/controller');
const templating = require('./templating');
const staticFiles = require('./static-files');
const checkFileAge = require('./middlewares/checkFileAge');
const checkRunning = require('./middlewares/checkRunning');
const musitedeep = require('./middlewares/musitedeep');
const processDP = require("./middlewares/processDP");
const processBlastuserquery = require("./middlewares/processBlastuserquery");
const fs = require( 'fs' );
const path = require('path');
const deleteFile = require("./middlewares/deleteFile");

const modeloptions = [
"Phosphoserine_Phosphothreonine",
"Phosphotyrosine",
"N-linked_glycosylation",
"O-linked_glycosylation",
"Ubiquitination",
"SUMOylation",
"N6-acetyllysine",
"Methylarginine",
"Methyllysine",
"Pyrrolidone_carboxylic_acid",
"S-palmitoyl_cysteine",
"Hydroxyproline",
"Hydroxylysine",
];

const blastoptions = [
"Phosphoserine",
"Phosphothreonine",
"Phosphotyrosine",
"N-linked_glycosylation",
"O-linked_glycosylation",
"Ubiquitination",
"SUMOylation",
"N6-acetyllysine",
"Methylarginine",
"Methyllysine",
"Pyrrolidone_carboxylic_acid",
"S-palmitoyl_cysteine",
"Hydroxyproline",
"Hydroxylysine",
];

//创建文件夹
function mkdirsSync( dirname ) {
  if (fs.existsSync( dirname )) {
    //console.log(dirname+" exists return")
    return true
  } else {
    if (mkdirsSync( path.dirname(dirname)) ) {
      fs.mkdirSync( dirname )
      return true
    }
  }
}


  processData = (input, output) =>{
    let results = [{}];
    let title=[">querySeq"];
    input = input.split(/[\r\n]+\>/);//devide sequences
    //inputs.shift(0);//delete the blank element no blank for \n>
    let tmp = [];
    let j=0;
    for(let e of input){
      e = e.split(/[\r\n]+/);
      if(j==0)
      {
      title[j]=e[0]; //the first title contains > 
      }else{
      title[j]=">"+e[0];
      }
      e.shift(0);//这个是id要去掉
      if(e[e.length - 1] === ''){
        e.pop();//如果最后一个是空也要去掉
      }
      
        e = e.join('').split('');
        e = e.filter(ele => {
         return ele.charCodeAt() !== 13 //delete spaces
       })
      tmp.push(e); //here e should be list not str
      //console.log("current e is"+e)
      j++;
    }
    
    output = output.split(/[\r\n]+/);
    if(output[output.length - 1] === ''){
        output.pop();//如果最后一个是空也要去掉
    }
    //console.log(output);
    let outputhash = {};
    let scores;
    let score;
    let pos;
    let id;
    let ptmtypes;
    let lastshow="";
    for(j=1;j<output.length;j++) //output加了header j 从1开始
    {
        if(output[j].charAt(0)=='>')
        {
           id = output[j];
           j+=1; //read next line
        }
        residue = output[j].split("\t")[1];
        lastshow=output[j].split("\t")[2];
        passcutoff=output[j].split("\t")[3];
        //console.log(lastshow)
        pos = output[j].split("\t")[0];
        if(outputhash.hasOwnProperty(id)){
           outputhash[id].push(pos+"\t"+residue+"\t"+lastshow+"\t"+passcutoff);
        }else{
            outputhash[id]=[];
            outputhash[id][0]=pos+"\t"+residue+"\t"+lastshow+"\t"+passcutoff;
        }
        
    }
    let key;
    for(let i = 0; i < title.length; i +=1){
      results[i] = {};
      results[i]["querySeq"]=tmp[i].join('')
      results[i]["Results"]=[]
      //results[i]["Position"]=[]
      //results[i]["PTMscores"]=[]
      //results[i]["Residue"]=[]
      //results[i]["Cutoff=0.5"]=[]
      id = title[i];
      key = id
      if(outputhash.hasOwnProperty(key))//output has this id
      {
          for(j=0;j<outputhash[key].length;j++)
          {
             pos = outputhash[key][j].split("\t")[0];
             residue = outputhash[key][j].split("\t")[1];
             score = outputhash[key][j].split("\t")[2];
             passcutoff = outputhash[key][j].split("\t")[3];
             print = {}
             print["Position"] = pos
             print["PTMscores"]=score
             print["Residue"]=residue
             print["Cutoff=0.5"]=passcutoff
             results[i]["Results"].push(print);
          }
      }
    }
    
    //console.log(results)
    return JSON.stringify(results[0])
}

const app = new Koa();

//https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9
//router.use((req, res, next) => {
//  res.header('Access-Control-Allow-Origin', '*');
//  next();
//});
//
//router.get('/api/alignments', (req, res) => {
//  request(
//    { url: 'https://g2s.genomenexus.org/api/alignments/' },
//    (error, response, body) => {
//      if (error || response.statusCode !== 200) {
//        return res.status(500).json({ type: 'error', message: err.message });
//      }
//
//      res.json(JSON.parse(body));
//    }
//  )
//});
//



//发起get/post请求时会打印所请求的接口
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

app.use(bodyParser());

//遍历static目录，使node可以调用该目录下的文件
app.use(staticFiles('/static/', __dirname + '/static'));

//遍历users/upload-files目录，使node可以调用该目录下的文件 在common不存在时可能会报错？
app.use(staticFiles('/users/', __dirname + '/users'));
app.use(staticFiles('/users/upload-files/', __dirname + '/users/upload-files'));


//遍历controllers目录，使node可以调用该目录下的文件
app.use(staticFiles('/controllers/', __dirname + '/controllers'));

//初始化views目录下的html文件（目前只有一个global地球的），这里面的html文件是独立的，不是react
app.use(templating('views', {}));

app.use(controller());

//检查文件存在的时间，默认72小时，每小时检查一次，可以调整
setInterval(() => {app.use(checkFileAge(__dirname + '/users/upload-files', 259200000))}, 360000);
//检查common能不能存在，会不会报错。
//setInterval(() => {app.use(checkFileAge(__dirname + '/users/upload-files', 60000))}, 6000);

//每1秒，后台检查一次是否有job结束。
setInterval(() => {app.use(checkRunning.checkRunning())}, 1000);




router.get('/musitedeep/:model/:seqs/', async(ctx, next) => {
 let model = ctx.params.model;
 let models = model.split(";")
 for(let j=0;j<models.length;j++)
 {
    if(!modeloptions.includes(models[j]))
    {
    ctx.body = JSON.stringify({"Error":models[j]+" is not a supported model"});
    return;
    }
 }
 let seqs = ctx.params.seqs
 let aanum = seqs.length;
 if(aanum >= 1000)
 {
     ctx.body = JSON.stringify({"Error":"1000 residues at most"});
     return;
 }
 if(seqs.match(/^[a-zA-Z-\*]+$/)==null)
 {
     ctx.body = JSON.stringify({"Error":"Invalid Sequence"});
     return;
 }
 data = ">querySeq\n"+seqs+"\n"
 //ctx.body = [{"4":"Phosphoserine:0.823","24":"Phosphoserine:0.423"}];
 let time = new Date().toISOString()
 let userId = "predict"+time + Number(Math.random().toString().substr(2)).toString(36);
 let inputFile = "input.fasta";
 let outputprefix = "prediction";
 let outputFile = outputprefix + '_results.txt';
 //console.log(userId)
 let mkdirResult = mkdirsSync(`users/upload-files/${userId}/`);
 let inputFileUrl = `users/upload-files/${userId}/${inputFile}`;
 let outputFileUrl = `users/upload-files/${userId}/${outputFile}`;
 fs.writeFileSync(`users/upload-files/${userId}/${inputFile}`, data);
 let cmdStr = `python3 MusiteDeep/predict_multi_batch.py -input ${inputFileUrl} -output users/upload-files/${userId}/${outputprefix} -model-prefix "MusiteDeep/models/${model}"`
 //console.log(cmdStr);
 let result = await processDP(cmdStr, inputFileUrl, outputFileUrl);
 ctx.body = processData(result[0],result[1]);
 await deleteFile(`users/upload-files/${userId}/`)

});

//http://localhost:5000/musitedeep/Phosphoserine_Phosphothreonine/ABCDEFGTDFG
//router.use('/musitedeep/:model/:seqs/', musitedeep())


processBlastResult = (output) =>{
    let result={};
    let title=[">querySeq"];
    output = output.split(/[\r\n]+/);//devide sequences
    if(output[output.length - 1] === ''){
        output.pop();//如果最后一个是空也要去掉
    }
    //console.log(output)
    result["querySeq"]=output[1]
    result["BlastResults"]=[]
    for(let j=2;j<output.length;j=j+2)
    {   
        blast1 = output[j]
        blast2 = output[j+1]
        blastid = blast1.split("\t")[0]
        blastidentity = blast1.split("\t")[1]
        PTM = blast1.split("\t")[2]
        blastseq = blast2
        temphash = {}
        temphash['PID']=blastid
        temphash['Identity']=blastidentity
        temphash['PTMPosition']=PTM
        temphash['Seq']=blastseq
        result["BlastResults"].push(temphash)
    }
    return result
}
router.get('/blast/:blastOptions/:seqs/', async(ctx, next) => {
 let blastOptions = ctx.params.blastOptions//.split(";").join("_")
 //console.log(blastOptions)
 let models = blastOptions.split(";")
 for(let j=0;j<models.length;j++)
 {
    if(!blastoptions.includes(models[j]))
    {
    ctx.body = JSON.stringify({"Error":models[j]+" is not a supported PTM types"});
    return;
    }
 }
 let seqs = ctx.params.seqs
 let aanum = seqs.length;
 if(aanum >= 1000)
 {
     ctx.body = JSON.stringify({"Error":"1000 residues at most"});
     return;
 }
 if(seqs.match(/^[a-zA-Z-\*]+$/)==null)
 {
     ctx.body = JSON.stringify({"Error":"Invalid Sequence"});
     return;
 }
 data = ">querySeq\n"+seqs+"\n"
 //ctx.body = [{"4":"Phosphoserine:0.823","24":"Phosphoserine:0.423"}];
 let time = new Date().toISOString()
 let userId = "blast"+time + Number(Math.random().toString().substr(2)).toString(36);
 let inputFile = "sequence.fasta";
 let mkdirResult = mkdirsSync(`users/upload-files/${userId}/`);
 let inputFileUrl = `users/upload-files/${userId}/${inputFile}`;
 let outputFolder=`users/upload-files/${userId}/`
 let outputFileUrl = `${outputFolder}/blastresult.txt`
 let blastParseUrl = `mongoblast/user_query.py`;
 fs.writeFileSync(`${inputFileUrl}`, data);
 
let cmdStr = `python3 ${blastParseUrl} -query ${inputFileUrl} -o ${outputFolder} -ptms "${blastOptions}"`
 //console.log(cmdStr);
 let result = await processBlastuserquery(cmdStr, outputFileUrl);
 //console.log(result[0])
 ctx.body = processBlastResult(result[0]);
 await deleteFile(`users/upload-files/${userId}/`)
});

//http://localhost:5000/blast/Phosphoserine_Phosphothreonine/MERSPAVCCQDPRAELVERVAAISVAHLEEAEEGPEPASNGVDPPPRARAASVIPGSASRPTPVRPSLSARKFSLQERPAGSCLEAQVGPYSTG
app.use(router.routes());


app.listen(5000);

console.log('app started at port 5000...');