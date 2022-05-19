/*
 *读取markdown文件的内容
 * markdown文件加载器，能够直接在代码中导入markdown文件，一般被html后。在页面上显示
 */
//将markdown语法转成html
const marked = require('marked')
// const {getOptions} =require('loader-utils') //获取loader的配置项
//导出一个函数 建议使用普通函数
//通过source参数接收输入
module.exports = function (source) {
	//获取loader的配置项
	// const options = getOptions(this)
	console.log('my loader', this.query) //不需要loader-utils插件
	// return 'my loader'

	//返回必须是js代码
	// return 'console.log("my loader")'

	const html = marked.parse(source)
	//直接返回，可能因为“”导致报错""<h1 id="关于">关于</h1><p>我是张三</p>"
	// return `module.exports = "${html}"`
	// return `module.exports = ${JSON.stringify(html)}` //source直接转入output
	//多个loader只要保证最后一个是js代码就行

	//直接返回html，交给下一个loader进行处理
	return html
}
