const os = require("os");
const path = require("path");
const ESLintPlugin = require("eslint-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

// 获取当前电脑cpu核数
const threads = os.cpus().length;

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
	entry: {
		main: "./src/main.js",
		index: "./src/index.js",
	},
	output: {
		// 文件输出路径 要求绝对路径
		path: path.resolve(__dirname, "../dist"),
		/**
		 * [name]是webpack命名规则，使用chunk的name作为输出的文件名。
		 * 什么是chunk？打包的资源就是chunk，输出出去叫bundle。
		 * chunk的name是啥呢？ 比如：entry中xxx: "./src/yyy.js", name就是xxx。和文件名无关。
		 */
		filename: "js/[name].js",
		// 在打包之前 将path整个目录内容清空 再进行打包
		clean: true,
	},
	module: {
		rules: [
			// loader的配置
			{
				oneOf: [
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
						use: [
							{
								// 开启多进程
								loader: "thread-loader",
								options: {
									// 进程数量
									works: threads,
								},
							},
							{
								loader: "babel-loader",
								options: {
									/**
									 * cacheDirectory：默认值为 false。
									 * 当有设置时，指定的目录将用来缓存 loader 的执行结果。
									 * 之后的 webpack 构建，将会尝试读取缓存，来避免在每次执行时，可能产生的、
									 * 高性能消耗的 Babel 重新编译过程(recompilation process)。
									 * 如果设置了一个空值 (loader: 'babel-loader?cacheDirectory')
									 * 或者 true (loader: 'babel-loader?cacheDirectory=true')，l
									 * oader 将使用默认的缓存目录 node_modules/.cache/babel-loader，
									 * 如果在任何根目录下都没有找到 node_modules 目录，将会降级回退到操作系统默认的临时文件目录。
									 */
									cacheDirectory: true,
									/**
									 * cacheCompression：默认值为 true。
									 * 当设置此值时，会使用 Gzip 压缩每个 Babel transform 输出。
									 * 如果你想要退出缓存压缩，将它设置为 false
									 * 如果你的项目中有数千个文件需要压缩转译，那么设置此选项可能会从中收益。
									 */
									cacheCompression: false,
								},
							},
						],
					},
				],
			},
		],
	},
	// 插件
	plugins: [
		new ESLintPlugin({
			// 指定检查文件的根目录
			context: path.resolve(__dirname, "../src"),
			cache: true,
			cacheLocation: path.resolve(__dirname, "../node_modules/.cache/eslint"),
			threads,
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
	],
	optimization: {
		splitChunks: {
			// 对所有模块都进行分割
			chunks: "all",
			// 以下是默认值
			// minSize: 20000, // 分割代码最小的大小
			// minRemainingSize: 0, // 类似于minSize，最后确保提取的文件大小不能为0
			// minChunks: 1, // 至少被引用的次数，满足条件才会代码分割
			// maxAsyncRequests: 30, // 按需加载时并行加载的文件的最大数量
			// maxInitialRequests: 30, // 入口js文件最大并行请求数量
			// enforceSizeThreshold: 50000, // 超过50kb一定会单独打包（此时会忽略minRemainingSize、maxAsyncRequests、maxInitialRequests）
			// cacheGroups: { // 组，哪些模块要打包到一个组
			//   defaultVendors: { // 组名
			//     test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
			//     priority: -10, // 权重（越大越高）
			//     reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
			//   },
			//   default: { // 其他没有写的配置会使用上面的默认值
			//     minChunks: 2, // 这里的minChunks权重更大
			//     priority: -20,
			//     reuseExistingChunk: true,
			//   },
			// },
			// 修改配置
			cacheGroups: {
				// 组，哪些模块要打包到一个组
				// defaultVendors: { // 组名
				//   test: /[\\/]node_modules[\\/]/, // 需要打包到一起的模块
				//   priority: -10, // 权重（越大越高）
				//   reuseExistingChunk: true, // 如果当前 chunk 包含已从主 bundle 中拆分出的模块，则它将被重用，而不是生成新的模块
				// },
				default: {
					// 其他没有写的配置会使用上面的默认值
					name: "sum",
					minSize: 0, // 我们定义的文件体积太小了，所以要改打包的最小文件体积
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true,
				},
			},
		},
		minimizer: [
			// css压缩
			new CssMinimizerPlugin(),
			// js压缩
			new TerserWebpackPlugin({
				// 开启多进程和设置进程数量
				parallel: threads,
			}),
		],
	},
	devtool: "source-map",
	// mode: "production",
	mode: "development",
};
