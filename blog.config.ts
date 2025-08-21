import type { NitroConfig } from 'nitropack'
import type { FeedEntry } from './app/types/feed'
import redirectList from './redirects.json'

export { zhCN as dateLocale } from 'date-fns/locale/zh-CN'

// 存储 nuxt.config 和 app.config 共用的配置
// 此处为启动时需要的配置，启动后可变配置位于 app/app.config.ts
const blogConfig = {
	title: '字节追风者',
	subtitle: '博客爱好者',
	// 长 description 利好于 SEO
	description: '你好，我是轻语，一名热爱技术与探索的博客作者，立志成长为一名全栈工程师。在这里，我记录前端与后端的学习过程、实战项目心得，也分享日常生活中的点滴灵感。🚀 信奉“折腾不止，摸鱼生活”，希望在不断摸索中找到属于自己的技术之路。',
	author: {
		name: '轻语',
		avatar: 'https://7.isyangs.cn/20250730/c65a56b5206f765b8a30203c71be985e.jpg',
		email: 'yzy11235@qq.com',
		homepage: 'https://yingzya.top/',
	},
	copyright: {
		abbr: 'CC BY-NC-SA 4.0',
		name: '署名-非商业性使用-相同方式共享 4.0 国际',
		url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans',
	},
	favicon: 'https://7.isyangs.cn/20250805/c77df6ed888acf748d49f457f1eb9d72.jpg',
	language: 'zh-CN',
	timeEstablished: '2025-03-19',
	timezone: 'Asia/Shanghai',
	url: 'https://yingzya.top/',

	defaultCategory: ['未分类'],

	feed: {
		limit: 50,
	},

	// 在 URL 中隐藏的路径前缀
	hideContentPrefixes: ['/posts'],

	imageDomains: [
		// 自动启用本域名的 Nuxt Image
		// 'yingzya.top',
		// '7.isyangs.cn',
	],

	// 禁止搜索引擎收录的路径
	robotsNotIndex: ['/preview', '/previews/*'],

	scripts: [
		// 自己部署的 Umami 统计服务
		//{ 'src': 'https://umami.yingzya.top/script.js', 'data-website-id': 'a5e67a3b-2526-4cad-8382-e5bc258ca79b', 'defer': true },
		// 自己网站的 Cloudflare Insights 统计服务
		//{ 'src': 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "97a4fe32ed8240ac8284e9bffaf03962"}', 'defer': true },
		// Twikoo 评论系统
		{ src: 'https://lib.baomitu.com/twikoo/1.6.44/twikoo.min.js', defer: true },
	],

	// 自己部署的 Twikoo 服务
	twikoo: {
		envId: 'https://yingzya.netlify.app/.netlify/functions/twikoo',
		preload: 'https://twikoo.zhilu.cyou/',
	},
}

// 用于生成 OPML 和友链页面配置
export const myFeed = <FeedEntry>{
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

// 将旧页面永久重定向到新页面
const redirectRouteRules = Object.entries(redirectList)
	.reduce<NitroConfig['routeRules']>((acc, [from, to]) => {
		acc![from] = { redirect: { to, statusCode: 301 } }
		return acc
	}, {})

// https://nitro.build/config#routerules
// @keep-sorted
export const routeRules = <NitroConfig['routeRules']>{
	...redirectRouteRules,
	'/api/stats': { prerender: true, headers: { 'Content-Type': 'application/json' } },
	'/atom.xml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
	'/favicon.ico': { redirect: { to: blogConfig.favicon } },
	'/zhilu.opml': { prerender: true, headers: { 'Content-Type': 'application/xml' } },
}

export default blogConfig
