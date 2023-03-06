import sum from "./js/sum";
import "./css/iconfont.css";
import "./css/index.css";
import "./less/index.less";
import "./sass/index.sass";
import "./scss/index.scss";
import "./stylus/index.styl";

const res = sum(1, 2);
console.log(res);
class A {}
console.log(A);

// 判断是否支持HMR功能
if (module.hot) {
	module.hot.accept("./js/sum", function () {
		const result = sum(1, 2, 3, 4);
		console.log(result);
	});
}
