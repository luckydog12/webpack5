const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/main.js",
	output: {
		// 开发模式没有输出 不需要指定输出路径
		path: undefined,
		filename: "main.js",
		// clean: true // 开发模式没有输出 不需要清空输出结果
	},
	module: {
		rules: [
			// loader的配置
			{
				test: /\.css$/,
				/**
				 * 执行顺序 从右到左（从上到下）
				 * css-loader 将css资源编译成commonjs的模块到js中
				 * style-loader 将js中的css通过创建style标签添加到html中生效
				 * index.html文件中不会看到style标签 需要通过f12查看elements面板
				 */
				use: ["style-loader", "css-loader"],
			},
			{
				test: /\.less$/,
				// loader: 'xxx' // 只能使用一个loader
				use: ["style-loader", "css-loader", "less-loader"],
			},
			{
				test: /\.s[ac]ss$/,
				use: ["style-loader", "css-loader", "sass-loader"],
			},
			{
				test: /\.styl$/,
				use: ["style-loader", "css-loader", "stylus-loader"],
			},
			{
				test: /\.(png|jpe?g|gif|webp|svg)$/,
				type: "asset",
				parser: {
					dataUrlCondition: {
						/**
						 * 小于20kb的图片转base 64
						 * 优点：减少请求数量
						 * 缺点：体积会更大 体积较小图片可以忽略
						 */
						maxSize: 20 * 1024, // 20kb
					},
				},
				generator: {
					/**
					 * 输出图片名称
					 * [hash:10] hash值取前10位
					 * [ext] 文件扩展名
					 */
					filename: "static/images/[hash:10][ext][query]",
				},
			},
			{
				test: /\.(ttf|woff2?)$/,
				// 字体图标不需要转base 64 采用asset/resource方式打包输出
				type: "asset/resource",
				generator: {
					filename: "static/fonts/[hash:10][ext][query]",
				},
			},
			{
				test: /\.js$/,
				// node_modules目录下文件无需编辑
				exclude: /node_modules/,
				loader: "babel-loader",
			},
		],
	},
	// 插件
	plugins: [
		new ESLintPlugin({
			// 指定检查文件的根目录
			context: path.resolve(__dirname, "../src"),
		}),
		new HtmlWebpackPlugin({
			/**
			 * 以 src/index.html 文件为模板创建新的html文件
			 * 新html文件特点： 内容和源文件一致 自动引入打包生成的js等资源
			 */
			template: path.resolve(__dirname, "../src/index.html"),
		}),
	],
	// 开发服务器：不会输出打包资源 在内存中编译打包
	devServer: {
		host: "localhost",
		port: "3000",
		// 自动打开浏览器
		open: true,
	},
	mode: "development",
};
