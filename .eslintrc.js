module.exports = {
	/**
	 * 自己配置规则过于麻烦
	 * 可以选择继承现有的规则
	 * 这里采用eslint官方提供的规则模板
	 * https://eslint.bootcss.com/docs/rules/
	 */
	extends: ["eslint:recommended"],
	env: {
		// 启用node中全局变量
		node: true,
		// 启用浏览器中全局变量
		browser: true,
	},
	parserOptions: {
		ecmaVersion: 6, // ES 语法版本
		sourceType: "module", // ES 模块化
	},
	rules: {
		// 不能使用var定义变量
		"no-var": 2,
	},
};
