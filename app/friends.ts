import type { FeedGroup } from '~/types/feed'
import { getGhAvatar } from './utils/img'

export default [{
	name: '相谈甚多',
	desc: '',
	entries: [{
		author: '测试',
		sitenick: 'Abloom',
		title: '唤青映记',
		desc: '博客测试中，如有侵权请联系我。',
		link: '',
		feed: '',
		icon: 'https://img.miasite.com/local/api/1/2024/12/EEES.png',
		avatar: getGhAvatar('abloom25'),
		archs: ['Hexo', 'Vercel'],
		date: '2024-12-09',
		comment: '博客测试中，如有侵权请联系我。',
	}],
}, {
	name: 'GXUers',
	desc: '广西大学的校友们。',
	entries: [{
		author: '测试',
		sitenick: '小屋',
		title: '半岛的小屋',
		desc: '博客测试中，如有侵权请联系我。',
		link: '',
		feed: '',
		icon: getGhAvatar('bandaoworld', { preset: 'icon' }),
		avatar: getGhAvatar('bandaoworld'),
		archs: ['Hexo', '服务器'],
		date: '2024-02-02',
		comment: '博客测试中，如有侵权请联系我。',
	}],
}, {
	name: '网上邻居',
	desc: '哔——啵——电波通讯中，欢迎常来串门。',
	entries: [{
		author: '测试',
		sitenick: 'Seraphonogram',
		title: '羽音 × Seraphonogram',
		desc: '博客测试中，如有侵权请联系我。',
		link: 'https://blog.navifox.net/',
		icon: '',
		avatar: 'https://blog.navifox.net/favicon.ico',
		archs: ['VitePress', '服务器'],
		date: '2025-07-14',
		comment: '博客测试中，如有侵权请联系我。',
	}],
}] satisfies FeedGroup[]
