//登录的入口文件
var fn_login = async(ctx, next) => {

	var email = ctx.request.body.email;
	var pwd = ctx.request.body.password;
	var mysql  = require('mysql'); 

	//Connection parameters	
	var connection = mysql.createConnection({     
		host     : 'localhost',       
		user     : 'root',              
	    password : 'YCjk-3323858067',       
	    port: '3306',                   
	    database: 'musite', 
	}); 

	//Sql
	var checkSql = "SELECT * FROM user WHERE email = '" + email + "' AND pwd = '" + pwd + "'";

	//Check if username and password are correct.
	var check = new Promise(function(resolve, reject){
		connection.query(checkSql, function(err, result){
			if(err){
				reject(err);
			}
			else if(result.length !== 0){
				//Set Cookie
				ctx.cookies.set('username', email, {
					httpOnly: false,
					maxAge: 24 * 3600 * 1000, //a day
					expires: new Date(Date.now() + 150 * 60 * 1000)
				})	

				resolve("Succeed!");
			}
			resolve("Wrong username or password!");
		});
	});

	//Send result to ajax
	ctx.response.body = await check;

}
	

module.exports = {
	'POST /login': fn_login
};