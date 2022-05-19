//公共配置文件
//适合大型项目使用这种区分环境的方式
//入口文件必须使用绝对路径
const { resolve } = require('path')
//引入插件plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //打包css到独立文件插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin') //每次打包前删除历史文件
const StylelintPlugin = require('stylelint-webpack-plugin') //校验样式文件格式
const EslintPlugin = require('eslint-webpack-plugin') //js代码格式校验
const CopyWebpackPlugin = require('copy-webpack-plugin') //不需要任何处理的文件,可以直接复制到输出目录
// const webpack = require('webpack') //webpack4 开启热更新，引入webpack

//提取公用模块
////通用的样式loader
const commonStyleLoader = [
	{
		loader: MiniCssExtractPlugin.loader,
		options: { publicPath: '../' },
	},
	'css-loader',
	'postcss-loader',
]
module.exports = {
	// entry: './src/index.js',
	// output: {
	// 	path: resolve(__dirname, '../output'),
	// 	filename: 'bundle.js',
	// },
	//多入口打包
	entry: {
		index: './src/index.js',
		about: './src/about.js',
	},
	//出口配置
	output: {
		path: resolve(__dirname, '../output'), //打包在config外面
		filename: '[name].[contenthash:8].js', //改成动态名字
	},
	//模块的解析规则
	resolve: {
		alias: {
			//指定路径的别名
			'@': resolve('src'),
		},
		//指定引入文件的后缀名（指定之后，再引入，可以省略后缀）
		extensions: ['.js', '.json', '.less'],
		//指定默认加载的路径
		modules: [resolve(__dirname, './node_modules'), 'node_modules'],
	},
	//优化策略
	optimization: {
		splitChunks: {
			chunks: 'all', //提取所有公共文件
		},
	},
	//排除打包依赖项
	externals: { jquery: 'jQuery' },
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: commonStyleLoader,
			},
			{
				test: /\.less$/i,
				use: [
					...commonStyleLoader, //展开
					'less-loader',
				],
			},
			//处理图片 $匹配所有 i忽略大小写
			{
				test: /\.(png|gif|jpe?g$)/i,
				// use: {
				// 	loader: "url-loader",
				// 	options: {
				// 		//指定图片大小,小于数值转为base64
				// 		limit: 8 * 1024, //8kb
				// 		//[name]图片原来的名称 ext是图片原来的后缀名
				// 		name: "image/[name].[ext]",
				// 		//关闭url-loader默认的ES Modules规范，强制使用CommonJS规范
				// 		esModule:false,
				// 	}
				// }

				//使用资源模块处理图片
				type: 'asset',
				//配置文件大小
				parser: {
					dataUrlCondition: {
						maxSize: 8 * 1024,
					},
				},
				//指定位置
				generator: {
					filename: 'image/[name][ext]',
				},
			},
			//图片路径
			//url-loader 默认采用ES Modules规范进行解析，但是html-loader引入图片使用的是CommonJS规范
			//解决：关闭url-loader默认的ES Modules规范，强制使用CommonJS规范
			{
				test: /\.(htm|html)$/i,
				use: {
					loader: 'html-loader',
					options: {
						//webpack4不需要此行代码
						esModule: false,
					},
				},
			},
			// js babel-loader
			{
				test: /\.m?js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						//第二次构建时，会读取之前的缓存
						// cacheDirectory: true,
						//不能转换高级特性，比如promise
						presets: [
							[
								'@babel/preset-env',
								{
									//按需加载
									useBuiltIns: 'usage',
									//corejs版本
									corejs: 3,
									//配置环境node环境还是浏览器环境
									// targets: 'defaults'
									//手动指定兼容浏览器的版本
									targets: {
										chrome: '58',
										ie: '9',
										firefox: '60',
										safari: '10',
										edge: '17',
									},
								},
							],
						],
					},
				},
			},
			//匹配字体文件
			{
				test: /\.(eot|svg|ttf|woff|woff2)$/i,
				// use: {
				// 	loader: 'file-loader',
				// 	options: {
				// 	name:'fonts/[name].[ext]'
				// }}
				//使用资源文件处理字体模块
				//asset可以在 asset/resource和 asset/inline之间进行选择
				//如果文件小于8kb（默认），使用asset/inline
				type: 'asset',
				//配置文件大小
				parser: {
					dataUrlCondition: {
						maxSize: 8 * 1024,
					},
				},
				//指定位置
				generator: {
					filename: 'fonts/[name][ext]',
				},
			},
			//匹配.md文件
			{
				test: /\.md$/i,
				//use:'./loader/markdown-loader'
				//可以使用多个loader，但是返回结果必须是js代码
				//不返回js代码，在打包后的文件，有可能语法不通过
				use: [
					'html-loader', //html-loader返回js代码
					// './loader/markdown-loader' //返回html-loadera处理
					{
						loader: './loader/markdown-loader',
						options: {
							size: 20 * 1024,
						},
					},
				],
			},
		],
	},
	//开发服务器
	devServer: {
		//指定加载内容的路径
		// contentBase: resolve(__dirname, 'output'),
		static: resolve(__dirname, 'output'),
		//启动gzip压缩
		compress: true,
		//端口号
		port: 9200,
		//启用自动更新 禁用hot
		liveReload: true,
		//配置代理解决接口kuayu
		proxy: {
			// http://localhost:9200/api 访问这个地址，指向github地址 http://localhost:9200/api/users=> https://api.github.com/api/users
			'/api': {
				target: 'https://api.github.com',
				//匹配路径里有/api，给他设置为空
				pathRewrite: {
					'^/api': '',
				},
				//不能localhost:9200作为github主机名,会报错
				changeOrigin: true,
			},
		},
	},
	//配置模版
	target: 'web',

	plugins: [
		new MiniCssExtractPlugin({
			filename: 'css/[name].[contenthash:8].css',
		}),
		// new StylelintPlugin({
		// 	files: ['src/css/*.{css,less,sass,scss}'],
		// }), //指定格式校验文件
		// js代码格式校验
		new EslintPlugin({
			//自动解决常规报错
			fix: true,
		}),
		//直接将src下不需要特殊处理的问题，直接复制到输出目录中
		new CopyWebpackPlugin({
			patterns: [{ from: 'src/public', to: 'public' }],
		}),
		//打包之前先删除历史文件
		new CleanWebpackPlugin(),
		//webpack4自带的热更新插件
		// new webpack.HotModuleReplacementPlugin(),
	],
}
