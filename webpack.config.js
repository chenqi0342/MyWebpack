/**
 * webpack5
 * webpack 配置文件
 * 配置后面的放在配置文件中
 * webpack ./src/index.js --output-path ./dist --mode=development
 * 遵循Commonjs规范
 */
//入口文件必须使用绝对路径
const { resolve } = require('path')
//引入插件plugin
const MiniCssExtractPlugin = require('mini-css-extract-plugin') //打包css到独立文件插件
const { CleanWebpackPlugin } = require('clean-webpack-plugin') //每次打包前删除历史文件
const StylelintPlugin = require('stylelint-webpack-plugin') //校验样式文件格式
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin') //压缩cssd代码
const HtmlWebpackPlugin = require('html-webpack-plugin') //自动生成html模版，并在html加载所有资源，指定html模版，设置html变量，压缩html
const EslintPlugin = require('eslint-webpack-plugin') //js代码格式校验
const CopyWebpackPlugin = require('copy-webpack-plugin') //不需要任何处理的文件,可以直接复制到输出目录
const webpack = require('webpack') //webpack4 开启热更新，引入webpack
//引入自定义插件
const MyPlugin = require('./plugin/MyPlugin')
module.exports = (env, argv) => {
	const config = {
		//打包模式
		//devlopment 开发模式
		//production 生产环境
		//none webpack不针对环境做特殊处理
		mode: 'development',
		//是一种源代码与构建后代码之间的映射技术
		//通过.map文件，将构建后的代码与源代码之间建立映射关系
		//Devtool:source-map| inline-source-map| hidden-source-map| nosources-source-map
		//eval模式，将js输出为字符串，不是ES Modules规范，导致tree shaking失效
		devtool: 'source-map', //eval-cheap-module-source-map没有经过loader加工
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
		//排除打包依赖项
		externals: { jquery: 'jQuery' },
		//入口文件
		//一般是js文件
		// entry: './src/index.js',
		//代码分离
		//所有代码打包到一起，可能最终的代码非常大，从而影响加载时间
		//很多代码初始是不需要的.因此，我们可以根据代码使用的紧急程度，将代码分割打包后，按需加载如何代码分离
		//多入口打包
		entry: {
			index: './src/index.js',
			about: './src/about.js',
		},
		//出口配置
		output: {
			path: resolve(__dirname, 'output'),
			filename: '[name].[contenthash:8].js', //动态名字限制8位
		},
		// output: {
		// 	//使用path模块的resolve方法指定绝对路径
		// 	path: resolve(__dirname, 'output'),
		// 	//导出文件的名称
		// 	filename: 'bundle.js',
		// },
		//优化策略
		//代码分割
		//如果多个页面都用到了一个公共文件，每个页面都将公共文件打包一次是不合理的，需要将公共文件提取出来
		optimization: {
			//标记未被使用的代码
			usedExports: true,
			//删除被usedExports标记的未使用的代码
			minimize: true,
			splitChunks: {
				chunks: 'all', //提取所有公共文件
			},
		},
		module: {
			rules: [
				//处理css资源模块 先后再前,开发环境不需要
				{
					test: /\.css$/i, //匹配处理文件的规则
					use: [
						// MiniCssExtractPlugin.loader, //将css打包到独立文件中,css体积超过150k才需要打包单独文件
						{
							loader: MiniCssExtractPlugin.loader,
							//处理css文件中的图片路径
							options: { publicPath: '../' },
						},
						// 'style-loader', //将css文件打包到style标签上
						'css-loader', //处理css资源模块，将css代码变成js代码片段
						'postcss-loader', //给样式属性添加浏览器前缀
					],
				},
				//处理less资源模块,开发环境不需要
				{
					test: /\.less$/i, //匹配处理文件的规则
					use: [
						// MiniCssExtractPlugin.loader,
						{
							loader: MiniCssExtractPlugin.loader,
							//处理less文件中的图片路径
							options: { publicPath: '../' },
						},
						// 'style-loader', //将css文件打包到style标签上
						'css-loader', //处理css资源模块，将css代码转译js代码片段
						'less-loader', //处理less资源模块，将less代码转译为css代码
						'postcss-loader', //给样式属性添加浏览器前缀
					],
				},
				//处理js文件 将es6语法转译成es5保证浏览器兼容性
				{
					test: /\.m?js$/,
					//排除包
					exclude: /node_modules/,
					use: {
						//通过babel进行转译
						loader: 'babel-loader',
						options: {
							//第二次构建时，会读取之前的缓存
							cacheDirectory: true,
							presets: [
								[
									//转译的规则集,转译不彻底，不能转移高级特性
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
				//处理图片 webpack4需要下载url-loader
				{
					test: /\.(png|gif|jpe?g$)/i,
					// use: {
					// 	// loader: 'file-loader',//将用到的图片复制到输出目录，过滤掉不用的图片
					// 	//转成base64字符串后，图片会跟js一起加载（减少图片的请求次数）
					// 	loader: 'url-loader', //file-loader升级版如果图片小于配置大小，会转成base64字符串
					// 	options: {
					// 		//指定图片大小,小于数值转为base64
					// 		limit: 8 * 1024, //8kb
					// 		//[name]图片原来的名称 ext是图片原来的后缀名 [name].后面加点图片路金不对无法显示
					// 		name: 'image/[name][ext]',
					// 		//关闭url-loader默认的ES Modules规范，强制使用CommonJS规范
					// 		esModule: false,
					// 	},
					// },
					//webpack 5 使用资源模块处理图片
					//资源模块是一种模块类型，它允许使用资源文件，而无需配置额外的loader
					//资源文件：字体，图片，图标，HTML…
					//不用file-loader url-loader也能加载图片和字体
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
				//htmlWebpackPlugin会检查目标文件是否已经有loader处理，
				//如果有其他loader处理，htmlWebpackPlugin不再使用lodash.template去处理ejs语法
				//解决：将htmlWebpackPlugin中，模版文件的后缀改成.ejs(非html)
				//html-loader可以处理静态资源，如果没有用.ejs，可以使用html-loader处理图片
				// {
				// 	test: /\.(htm|html)$/i,
				// 	use: {
				// 		loader: 'html-loader',
				// 		options: {
				// 			//webpack4不需要此行代码
				// 			esModule: false,
				// 		},
				// 	},
				// },
				//匹配字体文件
				{
					test: /\.(eot|svg|ttf|woff|woff2)$/i,
					// use: {
					// 	loader: 'file-loader',
					// 	options: {
					// 	name:'fonts/[name].[ext]'
					// }}
					//使用资源文件处理字体模块
					//资源模块是一种模块类型，它允许使用资源文件，而无需配置额外的loader
					//资源文件：字体，图片，图标，HTML…
					//不用file-loader url-loader也能加载图片和字体
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
		//发布web服务，提高效率
		//webpack4 webpack dev server
		//webpack5 webpack serve
		//webpack自动编译watch模式
		//会监听代码的变化，并没有将打包结果写入到磁盘中，
		//将结果存入内存中，然后通过http server读取出来，
		//发送给浏览器，减少磁盘读写操作，提高效率
		devServer: {
			//指定加载内容的路径,输出静态资源
			// contentBase: resolve(__dirname, 'output'),
			static: resolve(__dirname, 'output'),
			//启动gzip压缩
			compress: true,
			//端口号
			port: 9200,
			//热更新 webpack4
			// hot: true,
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
		//配置目标 配合devServer使用
		target: 'web',
		//插件配置
		//增强webpack自动化能力
		//除了资源加载以外的功能
		//删除上次打包的结果，压缩输出代码，拷贝静态资源
		plugins: [
			//打包css到独立文件插件
			new MiniCssExtractPlugin({
				//指定路径[name]保持原来的名字
				filename: 'css/[name].[contenthash:8].css',
			}),
			//打包前删除历史文件
			new CleanWebpackPlugin(),
			//校验样式代码格式
			// new StylelintPlugin({
			// 	//指定需要校验的文件
			// 	files: ['src/css/*.{css,less,sass,scss}'],
			// }),
			//处理html
			new HtmlWebpackPlugin({
				//指定打包后的文件名称
				filename: 'index.html',
				//用来指定生成的html模版
				template: './src/index.ejs',
				//指定html中使用的变量 ejs语法使用 <%= htmlWebpackPlugin.options.title %>
				title: '首页',
				meta: {
					viewport: 'width=device-width',
				},
				chunks: ['index'], //指定要加载的打包文件
			}),
			//打包多个html文件
			new HtmlWebpackPlugin({
				//指定打包后的文件名称
				filename: 'about.html',
				//用来指定生成的html模版
				template: './src/index.ejs',
				//指定html中使用的变量 ejs语法使用 <%= htmlWebpackPlugin.options.title %>
				title: '关于',
				meta: {
					viewport: 'width=device-width',
				},
				chunks: ['about'], //指定要加载的打包文件
			}),
			//js代码格式校验
			// new EslintPlugin({
			// 	//自动解决常规报错
			// 	fix: true,
			// }),
			//直接将src下不需要特殊处理的问题，直接复制到输出目录中
			//开发阶段最好不要使用这个插件,复制的太多影响效率
			// new CopyWebpackPlugin({
			// 	patterns: [{ from: 'src/public', to: 'public' }],
			// }),
			//webpack4自带的热更新插件
			// new webpack.HotModuleReplacementPlugin(),
			//引入自定义插件
			new MyPlugin({
				target: '.css',
			}),
		],
	}

	//判断当前是生产环境打包，中小型项目可以使用此方式区分环境
	if (env.production) {
		;(config.mode = 'production'),
			//是一种源代码与构建后代码之间的映射技术
			//通过.map文件，将构建后的代码与源代码之间建立映射关系
			(config.devtool = 'nosources-source-map'), //生产环境最好是none||nosources-source-map
			(config.plugins = [
				//打包css到独立文件插件
				new MiniCssExtractPlugin({
					//指定路径[name]保持原来的名字
					//如果代码在缓存期内，代码更新后看不到实时效果
					//将代码文件名称，设置为哈希名称，名称发生变化时，就加载最新的内容
					//webpack 哈希值
					//hash(每次webpack打包生成的hash值)
					//chunkhash(不同的chunk的hash值不同，同一次打包可能生成不同的chunk)//只会影响一路的打包
					//contenthash(不同内容的hash值不同，同一个chunk中可能有不同的内容)//针对一类内容
					filename: 'css/[name].[contenthash:8].css',
				}),
				//打包前删除历史文件
				new CleanWebpackPlugin(),
				//校验样式代码格式
				// new StylelintPlugin({
				// 	//指定需要校验的文件
				// 	files: ['src/css/*.{css,less,sass,scss}'],
				// }),
				//压缩css代码
				new OptimizeCssAssetsPlugin(),
				//处理html
				new HtmlWebpackPlugin({
					//指定打包后的文件名称
					filename: 'index.html',
					//用来指定生成的html模版
					template: './src/index.ejs',
					//指定html中使用的变量 ejs语法使用 <%= htmlWebpackPlugin.options.title %>
					title: '首页',
					meta: {
						viewport: 'width=device-width',
					},
					chunks: ['index'], //指定要加载的打包文件
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
					//指定html中使用的变量 ejs语法使用 <%= htmlWebpackPlugin.options.title %>
					title: '关于',
					meta: {
						viewport: 'width=device-width',
					},
					chunks: ['about'], //指定要加载的打包文件
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
				//js代码格式校验
				// new EslintPlugin({
				// 	//自动解决常规报错
				// 	fix: true,
				// }),
				//直接将src下不需要特殊处理的问题，直接复制到输出目录中
				//开发阶段最好不要使用这个插件,复制的太多影响效率
				new CopyWebpackPlugin({
					patterns: [{ from: 'src/public', to: 'public' }],
				}),
			])
	}
	return config
}
