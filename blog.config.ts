import type { FeedEntry } from './app/types/feed'

export { zhCN as dateLocale } from 'date-fns/locale/zh-CN'

const basicConfig = {
	title: '雨落川',
	subtitle: '云青青兮欲雨，水澹澹兮生烟',
	// 长 description 利好于 SEO
	description: '你好，我是轻语，一名热爱技术与探索的博客作者，立志成长为一名全栈工程师。在这里，我记录前端与后端的学习过程、实战项目心得，也分享日常生活中的点滴灵感。🚀 信奉“折腾不止，摸鱼生活”，希望在不断摸索中找到属于自己的技术之路。',
	author: {
		name: '轻语',
		avatar: 'https://assets.yangzy.top/avator.jpg',
		email: 'yzy11235@qq.com',
		homepage: 'https://yangzy.top/',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: 'https://assets.yangzy.top/avator.jpg',
	language: 'zh-CN',
	timeEstablished: '2025-03-19',
	timezone: 'Asia/Shanghai',
	url: 'https://blog.yangzy.top/',
	defaultCategory: '未分类',
}

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
// @keep-sorted
const blogConfig = {
	...basicConfig,

	article: {
		categories: {
			[basicConfig.defaultCategory]: { icon: 'ph:folder-dotted-bold' },
			经验分享: { icon: 'ph:mouse-bold', color: '#3af' },
			复习: { icon: 'ph:graduation-cap-bold', color: '#415cb3ff' },
			配置: { icon: 'ph:wrench-bold', color: '#6b7280' },
			Linux: { icon: 'ph:linux-logo-bold', color: '#facc15' },
			算法: { icon: 'ph:code-bold', color: '#8b5cf6' },
			实战项目: { icon: 'ph:rocket-launch-bold', color: '#f90' },
		},
		defaultCategoryIcon: 'ph:folder-bold',
		/** 分类排序方式，键为排序字段，值为显示名称 */
		order: {
			date: '创建日期',
			updated: '更新日期',
			// title: '标题',
		},
		/** 使用 pnpm new 新建文章时自动生成自定义链接（permalink/abbrlink） */
		useRandomPremalink: false,
		/** 隐藏基于文件路由（不是自定义链接）的 URL /post 路径前缀 */
		hidePostPrefix: true,
		/** 禁止搜索引擎收录的路径 */
		robotsNotIndex: ['/preview', '/previews/*'],
	},

	/** 博客 Atom 订阅源 */
	feed: {
		/** 订阅源最大文章数量 */
		limit: 50,
		/** 订阅源是否启用XSLT样式 */
		enableStyle: true,
	},

	/** 向 <head> 中添加脚本 */
	scripts: [
		// 自己部署的 Umami 统计服务
		// { 'src': 'https://zhi.zhilu.cyou/zhi.js', 'data-website-id': 'a1997c81-a42b-46f6-8d1d-8fbd67a8ef41', 'defer': true },
		// 自己网站的 Cloudflare Insights 统计服务
		// { 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "97a4fe32ed8240ac8284e9bffaf03962"}', 'defer': true },
		// Twikoo 评论系统
		{ src: 'https://lib.baomitu.com/twikoo/1.6.44/twikoo.min.js', defer: true },
	],

	/** 自己部署的 Twikoo 服务 */
	twikoo: {
		envId: 'https://yingzya.netlify.app/.netlify/functions/twikoo',
		preload: 'https://twikoo.zhilu.cyou/',
	},
}

/** 用于生成 OPML 和友链页面配置 */
export const myFeed: FeedEntry = {
	author: blogConfig.author.name,
	sitenick: '摸鱼处',
	title: blogConfig.title,
	desc: blogConfig.subtitle || blogConfig.description,
	link: blogConfig.url,
	feed: new URL('/atom.xml', blogConfig.url).toString(),
	icon: blogConfig.favicon,
	avatar: blogConfig.author.avatar,
	archs: ['Nuxt', 'Vercel'],
	date: blogConfig.timeEstablished,
	comment: '这是我自己',
}

export default blogConfig
