//生产配置文件
const { merge } = require('webpack-merge') //引入插件

const baseWebpackConfig = require('./webpack.base.conf') //引入base配置
const HtmlWebpackPlugin = require('html-webpack-plugin')//压缩
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')//压缩
const webpack = require('webpack')
const prodWebpackConfig = merge(baseWebpackConfig, {
	//这里是生产模式对应的配置
	mode: 'production',
	plugins: [
		new webpack.DefinePlugin({
			//生产环境下的接口地址js代码片段
			API_PROD_URL: JSON.stringify('43214321')
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
			//压缩html
			minify: {
				collapseWhitespace: true,
				keepClosingSlash: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true,
			},
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
			//压缩html
			minify: {
				collapseWhitespace: true,
				keepClosingSlash: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true,
			},
		}),
		//压缩css
		new OptimizeCssAssetsPlugin(),
	],
}) //合并

module.exports = prodWebpackConfig //导出
