//注册的入口文件
const mysql  = require('mysql');  
const fs = require( 'fs' );

var fn_register = async(ctx, next) => {

	//Delete cookie
	ctx.cookies.set('username', null);

	var email = ctx.request.body.email;
	var pwd = ctx.request.body.password;
	var filename = email;

	function mkdir(){
		fs.mkdirSync(`users/upload-files/${email}`);
	}

	//Connection parameters
	var connection = mysql.createConnection({     
		host     : 'localhost',       
		user     : 'root',              
	    password : 'YCjk-3323858067',       
	    port: '3306',                   
	    database: 'musite', 
	}); 

	//Sql
	var checkSql = "SELECT * FROM user WHERE email = '" + email + "'";
	var addSql = 'INSERT INTO user(email, pwd, filename) VALUES(?, ?, ?)';
	var addSqlParams = [email, pwd, filename];

	//Connect to database
	connection.connect(function(err){
		if(err) {
			throw err;
		}
	});

	//Insert user profile
	function insert(input){
		return new Promise(function(resolve, reject){
			if(input === "Account already exists"){
				resolve(input);
			}
			else{
				connection.query(addSql,addSqlParams,function (err, result) {
					if(err){
					    //console.log('[INSERT ERROR] - ',err.message);
					    resolve("Insertion Failed");
					    }      
					else{
						mkdir();
							ctx.cookies.set('username', email, {
								httpOnly: false,
								maxAge: 24 * 3600 * 1000, //a day
								expires: new Date(Date.now() + 150 * 60 * 1000)
							})	
						resolve("Account Created.");
					}
				});
			}
		});	
	}

	//Check if username already exists.
	var check = new Promise(function(resolve, reject){
		connection.query(checkSql, function(err, result){
			if(err){
				reject(err);
			}
			else if(result.length !== 0){
				resolve("Account already exists");
			}
			resolve("Succeed");
		});
	});

	//Pass result to ajax
	ctx.response.body = await check.then(insert);
}

module.exports = {
	'POST /register': fn_register
};