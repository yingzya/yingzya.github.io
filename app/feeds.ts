import type { FeedGroup } from '~/types/feed'
import { getFavicon, getGhAvatar, getGhIcon } from './utils/img'

export default [
	{
		name: '网上邻居',
		desc: '哔——啵——电波通讯中，欢迎常来串门。',
		// @keep-sorted { "keys": ["date"] }
		entries: [
			{
				author: '张洪Heo',
				desc: '分享设计与科技生活',
				link: 'https://blog.zhheo.com/',
				feed: 'https://blog.zhheo.com/atom.xml',
				icon: 'https://blog.zhheo.com/img/favicon4.0.webp',
				avatar: 'https://bu.dusays.com/2022/12/28/63ac2812183aa.png',
				archs: ['Hexo', '国内 CDN'],
				date: '2025-08-06',
				comment: '知名博主，其博客设计风格被众多人借鉴。',
			},
			{
				author: 'Soulter',
				desc: 'Code with love!',
				link: 'https://blog.soulter.top',
				feed: 'https://blog.soulter.top/atom.xml',
				icon: 'https://avatars.githubusercontent.com/u/37870767?v=4',
				avatar: 'https://avatars.githubusercontent.com/u/37870767?v=4',
				archs: ['Hexo', '国内 CDN'],
				date: '2025-08-09',
				comment: '技术博主，GitHub获得超12k stars',
			},
			{
				author: '𝟞𝟙𝟡',
				desc: '𝓙𝓾𝓼𝓽 𝓪 𝓬𝓵𝓸𝓾𝓭',
				link: 'https://66619.eu.org',
				feed: 'https://66619.eu.org/rss/feed.xml',
				icon: 'https://7.isyangs.cn/20250817/45951aa2614367e6f31cd976042d3d96.png',
				avatar: 'https://7.isyangs.cn/20250817/45951aa2614367e6f31cd976042d3d96.png',
				archs: ['NotionNext', '国内 CDN'],
				date: '2025-08-09',
				comment: '分享技术与生活瞬间',
			},
		],
	},
] satisfies FeedGroup[]
