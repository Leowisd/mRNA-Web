let fn_table = async(ctx, next) => {
	ctx.render('3dtable.html', {});
}

module.exports = {
	'GET /3dtable': fn_table
};