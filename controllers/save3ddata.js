//output.js 的post save3ddata 将由3dtable.html 调用这个数据
const fs = require( 'fs' );

var fn_save3ddata = async(ctx, next) => {
    var show3dID = ctx.request.body.show3dID;
	var seq = ctx.request.body.seq;
    var positions_select = ctx.request.body.positions_select;
	var data={};
	data['seq'] = seq;
    data['positions_select'] =positions_select;
	//console.log(data)
	fs.writeFileSync('users/upload-files/common/'+show3dID+'_show3d.json', JSON.stringify(data));
    
	ctx.response.body = data;

}
	

module.exports = {
	'POST /save3ddata': fn_save3ddata
};