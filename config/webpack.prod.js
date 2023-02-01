const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const getStyleLoaders = (loader) => {
	return [
		MiniCssExtractPlugin.loader,
		"css-loader",
		{
			loader: "postcss-loader",
			options: {
				postcssOptions: {
					plugins: [
						"postcss-preset-env", // 能解决大多数样式兼容性问题
					],
				},
			},
		},
		loader,
	].filter(Boolean);
};

module.exports = {
	entry: "./src/main.js",
	output: {
		// 文件输出路径 要求绝对路径
		path: path.resolve(__dirname, "../dist"),
		filename: "main.js",
		// 在打包之前 将path整个目录内容清空 再进行打包
		clean: true,
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
				use: getStyleLoaders(),
			},
			{
				test: /\.less$/,
				// loader: 'xxx' // 只能使用一个loader
				use: getStyleLoaders("less-loader"),
			},
			{
				test: /\.s[ac]ss$/,
				use: getStyleLoaders("sass-loader"),
			},
			{
				test: /\.styl$/,
				use: getStyleLoaders("stylus-loader"),
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
		// 本插件会将 CSS 提取到单独的文件中，为每个包含 CSS 的 JS 文件创建一个 CSS 文件，并且支持 CSS 和 SourceMaps 的按需加载。
		new MiniCssExtractPlugin({
			filename: "css/main.css",
		}),
		// css压缩
		new CssMinimizerPlugin(),
	],
	mode: "production",
};
