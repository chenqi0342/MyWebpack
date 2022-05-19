//自定义插件
//Webpack插件是一个具有apply方法的js对象
//apply方法会被webpack compiler调用，并且在整个编译生命周期都可以访问compiler对象
//通过在生命周期的钩子中挂载函数，来实现功能拓展
//生命周期：程序：初始化，挂载，渲染，展示，销毁
//钩子：钩子是提前在可能增加功能的地方，预设一个函数
class MyPlugin {
	constructor(options) {
        console.log('插件配置选项', options)
        this.userOptions =options || {}
	}

	//必须声明apply方法,webpack启动时被自动调用
	apply(compiler) {
		//在钩子挂载功能 tap方法注册，插件名称，挂载到钩子上的函数
		compiler.hooks.emit.tap('MyPlugin', (compilation) => {
			//compilation打包上下文 assets访问
			for (const name in compilation.assets) {
				console.log(name)
				//针对css文件，执行操作
				// if (name.endsWith('.css')) {
				if (name.endsWith(this.userOptions.target)) {
					//获取处理之前的内容
					const contents = compilation.assets[name].source()
					//将原来的内容，通过正则，删除注释
					const noComments = contents.replace(/\/\*[\s\S]*?\*\//g, '')
					//处理后的结果替换
					compilation.assets[name] = {
						source: () => noComments,
						size: () => noComments.length,
					}
				}
			}
		})
	}
}

module.exports = MyPlugin