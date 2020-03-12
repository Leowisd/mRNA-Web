//这个文件是blast请求的入口文件，根据用户的输入生成各种参数，然后调用中间件processBlast来执行，并返回结果
const fs = require( 'fs' );
const processBlast = require("../middlewares/processBlast");
const exec = require('child_process').exec;
const rimraf = require("rimraf");

//为了把从predict model得到的label转为blast 的annotation数据可以接受的label
const ptm_values={
"Phosphoserine_Phosphothreonine":"\"Phosphoserine_Phosphothreonine\"",
"Phosphotyrosine":"\"Phosphotyrosine\"",
"N-linked_glycosylation":"\"N-linked (GlcNAc) asparagine\"",
"O-linked_glycosylation":"\"O-linked (GlcNAc) serine_O-linked (GlcNAc) threonine\"",
"Ubiquitination":"\"Glycyl lysine isopeptide (Lys-Gly)(interchain with G-Cter in ubiquitin)\"",
"SUMOylation":"\"Glycyl lysine isopeptide (Lys-Gly)(interchain with G-Cter in SUMO)\"",
"N6-acetyllysine": "\"N6-acetyllysine\"",
"Methylarginine":"\"Omega-N-methylarginine_Dimethylated arginine_Symmetric dimethylarginine_Asymmetric dimethylarginine\"",
"Methyllysine": "\"N6-methyllysine_N6,N6-dimethyllysine_N6,N6,N6-trimethyllysine\"",
"Pyrrolidone_carboxylic_acid":"\"Pyrrolidone carboxylic acid\"",
"S-palmitoyl_cysteine":"\"S-palmitoyl cysteine\"",
"Hydroxyproline":"3-hydroxyproline_4-hydroxyproline",
"Hydroxylysine":"4,5-dihydroxylysine_3,4-dihydroxylysine_5-hydroxylysine"
}

//ptm_valuesbu 不可逆，因为annotation的ptm结果更详细，更具体！
//function swap(json){
//  var ret = {};
//  for(var key in json){
//    ret[json[key]] = key;
//  }
//  return ret;
//}

//ptm_values_rev=swap(ptm_values)
//console.log(ptm_values_rev);
let fn_blast = async(ctx, next) => {

  let userId = ctx.request.body.userId;
  let seq = ctx.request.body.seq; //get current seq for blast
  let blastOptions = ctx.request.body.blastOptions;
  let options = "";
  //options = blastOptions['value']
  console.log(blastOptions)
  for(let e of blastOptions){
    console.log(e['value']);
  	options = options + ptm_values[e['value']] + "_";
  }
  options = options.replace(/_$/,"");
  
  console.log(options)
  //options = Object.values(blastOptions).join("_");
  let inputFile = 'sequence.fasta';
  //File path for system command
  let inputFileUrl = `users/upload-files/${userId}/blast/${inputFile}`;
  let formatUrl = `users/upload-files/${userId}/blast/format11.asn`;
  //let format2output = `users/upload-files/${userId}/blast/format2.txt`;
  //let format6output = `users/upload-files/${userId}/blast/format6.txt`;
  let blastParseUrl = `mongoblast/codes/blast_parse.py`;
  let blastUrl = `users/upload-files/${userId}/blast/`;
  let blastdb = `mydb`
  let blastformat6 = "\"6 qseqid sseqid pident\""
  let blastformat2 = "2"

  //File path for node.js
  let blastroot = `users/upload-files/${userId}/`
  let blastPath = `users/upload-files/${userId}/blast/`;
  let inputFilePath = `users/upload-files/${userId}/blast/${inputFile}`;

  mkdir(blastroot, blastPath,inputFilePath, seq);

  //let cmdStr1 = `cd $HOME/PTMweb/mongoBlast-master/mongo_blast && makeblastdb -in background_seqs.fasta -dbtype prot`;
  let cmdStr2 = `blastp -query ${inputFileUrl} -db ${blastdb} -evalue 1e-5 -max_target_seqs 10 -outfmt 11 -out ${formatUrl}`;
  //let cmdStr3 = `blast_formatter -archive ${formatUrl} -outfmt ${blastformat6}  -out ${format6output}`;
  //let cmdStr4 = `blast_formatter -archive ${formatUrl} -outfmt ${blastformat2}  -out ${format2output}`;
  let cmdStr3 = `python3 ${blastParseUrl} -l ${formatUrl} -ptms ${options} -o ${blastUrl}`;
  //let cmdStr5 = `python ${blastParseUrl} -l ${format2output} -o ${blastUrl}`;
  let result = await processBlast(cmdStr2, cmdStr3,blastPath,options);
  ctx.response.body = await result;
}

//在用户目录下生成blast目录
function mkdir(blastroot,blastPath, inputFilePath, seq){
  if(fs.existsSync(blastroot)){
    //rimraf(blastroot, err => {
    //  if(err){
    //    console.log(err);
    //  }
    //  else{
    //    //fs.mkdirSync(blastroot);
    //    fs.mkdirSync(blastPath);  
    //    fs.writeFileSync(inputFilePath, seq);      
    //  }
    //})
    if(!fs.existsSync(blastPath)){
        fs.mkdirSync(blastPath);  
    }
    fs.writeFileSync(inputFilePath, seq);
  }
  else {
    fs.mkdirSync(blastroot);
    fs.mkdirSync(blastPath);
    fs.writeFileSync(inputFilePath, seq);
  }
  
}

module.exports = {
	'POST /blast': fn_blast
};

//cd $HOME/mongoBlast/mongo_blast && blastp -task blastp -query $HOME/musite/users/upload-files/jyuchi@mail.missouri.eduuuu/blast/sequence.fasta -db background_seqs.fasta -evalue 1e-5 -num_descriptions 100 -num_alignments 100 -outfmt 2 -out $HOME/mongoBlast/mongo_blast/format2.txt
//cd $HOME/mongoBlast/mongo_blast && python $HOME/mongoBlast/mongo_blast/blast_parse.py -l $HOME/mongoBlast/mongo_blast/format2.txt -ptms Phosphotyrosine -o $HOME/musite/users/upload-files/jyuchi@mail.missouri.eduuuu/blast/

//cd $HOME/mongoBlast/mongo_blast && blastp -task blastp -query example.fasta -db background_seqs.fasta -evalue 1e-5 -num_descriptions 20 -num_alignments 20 -outfmt 2 -out format2.txt
//cd $HOME/mongoBlast/mongo_blast && python blast_parse.py -l format2.txt -ptms Phosphotyrosine -o other   