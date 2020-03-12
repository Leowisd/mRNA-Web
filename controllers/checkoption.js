//记录ip地址并把新的地址放到visitors.json里，页面上显示的访问量就来自这个json文件
const fs = require( 'fs' );

var fn_checkoption = async(ctx, next) => {
	var userID = ctx.request.body.userID;
    var JobID = ctx.request.body.JobID;
    let filepath = `users/upload-files/${userID}/${JobID}/modelOptions.json`;
	console.log("open "+filepath);
    var modelOptions =[{ label: 'phosphorylation (S,T)', value:"Phosphoserine_Phosphothreonine"}];
    let output = new Promise(function(resolve, reject){
    fs.readFile(filepath, 'utf-8', function(err, data){
	if(err){
		console.log(err);
        reject(err);
	}
	else{
		data = JSON.parse(data);
         console.log(data)
		modelOptions = data['models'];
		console.log(modelOptions)
        resolve(modelOptions);
	 }	
	 })
    console.log(modelOptions);
    console.log("program ended 2");
    });
    
    ctx.response.body = await output;
}

//下面的Sync也work，下面是同步的实现。不明白为什么要用异步。
//var fn_checkoption = async(ctx, next) => {
//	var userID = ctx.request.body.userID;
//    var JobID = ctx.request.body.JobID;
//    let filepath = `users/upload-files/common/${userID+JobID}_modelOptions.json`;
//	console.log("open "+filepath);
//    let res=[];
//    var modelOptions =[{ label: 'phosphorylation (S,T)', value:"Phosphoserine_Phosphothreonine"}];
//    var data = fs.readFileSync(filepath, 'utf-8');
//    data = JSON.parse(data);
//    console.log(data)
//    modelOptions = data['models'];
//    ctx.response.body = modelOptions;
//}


module.exports = {
	'POST /checkoption': fn_checkoption
};