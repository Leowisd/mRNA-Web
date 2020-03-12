//记录ip地址并把新的地址放到visitors.json里，页面上显示的访问量就来自这个json文件
const fs = require( 'fs' );

var fn_location = async(ctx, next) => {

	var location = ctx.request.body.location;
	fs.readFile('static/visitors/visitors.json', 'utf-8', function(err, data){
		if(err){
			console.log(err);
		}
		else{
			data = JSON.parse(data);
			let visitors = data['visitors'] || [];
			for(let e of visitors){
				let ip = e['ip'] || '';
				if(location['ip'] == ip) return; //the ip is same as in the visitor list
			}
			visitors.push(location);
			data['visitors'] = visitors;
			//console.log(data)
			fs.writeFileSync('static/visitors/visitors.json', JSON.stringify(data));
		}	
	})
    //console.log("end location");
	ctx.response.body = location; //这里的返回不需要等待上面的read及写操作完成，可以直接返回，因为location并没有改变。

}
	

module.exports = {
	'POST /location': fn_location
};