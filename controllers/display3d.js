let fn_display3d = async(ctx, next) => {
	ctx.render('display3d.html', {});
}

module.exports = {
	'GET /display3d': fn_display3d
};