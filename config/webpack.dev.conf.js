//开发的配置文件
const { merge } = require('webpack-merge') //引入插件
const baseWebpackConfig = require('./webpack.base.conf') //引入base配置
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
//引入自定义插件
const MyPlugin = require('../plugin/MyPlugin')
const devWebpackConfig = merge(baseWebpackConfig, {
	//这里是开发模式对应的配置
	mode: 'development',
	plugins: [
		new webpack.DefinePlugin({
			//开发环境下的接口地址
			// API_BASE_URL: 'xxxxxxxx' //打包之后不是一个字符串，变量后面的值是代码片段
			API_BASE_URL: JSON.stringify('12341234'),
		}),
		//html配置
		new HtmlWebpackPlugin({
			//指定打包后的文件名称
			filename: 'index.html',
			//用来指定生成的html模版
			template: './src/index.ejs',
			//指定html中使用的变量 <%= htmlWebapckPlugin.options.title %>
            title: '其他的额外功能1',
            chunks:['index'], //指定要加载的打包文件
		}),
		//打包多个html文件
		new HtmlWebpackPlugin({
			//指定打包后的文件名称
			filename: 'about.html',
			//用来指定生成的html模版
			template: './src/index.ejs',
			//指定html中使用的变量 <%= htmlWebapckPlugin.options.title %>
            title: '其他的额外功能2',
            chunks:['about'], //指定要加载的打包文件
		}),
		//引入自定义插件
		new MyPlugin({
			target: '.css',
		}),
	],
}) //合并

module.exports = devWebpackConfig //导出
