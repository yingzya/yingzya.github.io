import type { FeedGroup } from '~/types/feed'
import { getFavicon, getGhAvatar, getGhIcon, getQqAvatar, QqAvatarSize } from './utils/img'

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
				icon: 'https://image.66619.eu.org/file/3db3168b82b1137c0e4d7.png',
				avatar: 'https://image.66619.eu.org/file/3db3168b82b1137c0e4d7.png',
				archs: ['NotionNext', '国内 CDN'],
				date: '2025-08-09',
				comment: '分享技术与生活瞬间',
			},
			{
				author: 'Echo',
				desc: 'Life is a coding,I will debug it.',
				link: 'https://www.liveout.cn/',
				feed: 'https://liveout.cn/feed/',
				icon: 'https://liveout.cn/usr/uploads/pic/icon1.jpg',
				avatar: 'https://liveout.cn/usr/uploads/pic/icon1.jpg',
				archs: ['Typecho', '国内 CDN'],
				date: '2026-04-09',
			},
		],
	},
] satisfies FeedGroup[]
