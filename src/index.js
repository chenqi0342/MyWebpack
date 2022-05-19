/**
 * webpack打包的入口js文件
 * webpack根据入口文件import,require解析推断出文件依赖的资源模块，
 * 分别去解析每个资源模块对应的依赖，得到一个依赖关系树，
 * webpack递归依赖树，找到每个节点对应的资源文件，根据source找到模块对应的loader，交给loader去处理
 */
import $ from 'jquery';
// 测试webpack能否处理json文件
import data from './data.json';
// 以模块的方式引入图片
import boy from './image/xusheng.gif';
import homeIcon from './image/icon/face001.png';
import about from './about.md';
import './css/mian.css';
import './css/mian';
import { add } from '@/math'
// eslint-disable-next-line
console.log('2+4',add(2,4))
// 引入项目样式文件
// 使用模块，不需要引入项目的成员
// import {} from './css/mian.css';
// import {} from './css/mian.less';
// 会转译所有的js语法 体积较大
// import '@babel/polyfill'
// eslint-disable-next-line
console.log(data)

const showMsg = () => {
  // eslint-disable-next-line
	alert('hello')
};
// eslint-disable-next-line
window.showMsg = showMsg // 挂载到外部

const p = new Promise((resolve) => {
  setTimeout(() => {
    // eslint-disable-next-line
		console.log('Promise is working')
    resolve();
  }, 1000);
});

// eslint-disable-next-line
console.log(p)

// eslint-disable-next-line
const img = new Image();
img.src = boy;
// eslint-disable-next-line
document.body.append(img);

// eslint-disable-next-line
const img1 = new Image();
img1.src = homeIcon;
// eslint-disable-next-line
document.body.append(img1);
// eslint-disable-next-line
// console.log('开发接口地址', API_BASE_URL);
// eslint-disable-next-line
// console.log('生产接口地址', API_PROD_URL);
// eslint-disable-next-line
console.log(about, 'md格式文件')
// 给body添加页脚（包括备案号）
$('body').append('<h3>11323123123123</h3>');
//代码分割 懒加载预加载
//验证按需加载
document.getElementById('btn').onclick = function () {
  //import 启动懒加载
  //webpackChunkName: 'desc' 指定打包文件的名称
  //webpackPrefetch:true 启动预加载//network中可以看见,移动端有兼容性
  // eslint-disable-next-line
  import(/*webpackChunkName: 'desc',webpackPrefetch:true*/ './wp').then(({ desc }) => {
    alert(desc())
  })
}
// eslint-disable-next-line
// console.log11(data,'123')