//打开地球
let fn_global = async(ctx, next) => {
	ctx.render('global.html', {});
}

module.exports = {
	'GET /global': fn_global
};