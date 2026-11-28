import { formatInTimeZone } from 'date-fns-tz'
import blogConfig from '~~/blog.config'
import { parseArticleDate } from '~~/shared/utils/articleDate'

interface StatsEntry {
	posts: number
	words: number
}

interface CategoryEntry {
	name: string
	posts: number
	children?: CategoryEntry[]
}

export default defineEventHandler(async (event) => {
	const stats = {
		total: { posts: 0, words: 0 },
		annual: <Record<number, StatsEntry>>{},
		categories: <CategoryEntry[]>[],
		tags: <string[]>[],
	}

	const existedPath = new Map()

	const query = queryCollection(event, 'content')
	if (blogConfig.stats.includePaths.length) {
		query.orWhere(group => blogConfig.stats.includePaths.reduce(
			(group, pattern) => group.where('stem', 'LIKE', pattern),
			group,
		))
	}
	const posts = await query.all()

	const findOrCreateCategory = (
		name: string,
		tree: CategoryEntry[],
	): CategoryEntry => {
		let category = tree.find(entry => entry.name === name)
		if (!category) {
			category = { name, posts: 0 }
			tree.push(category)
		}
		return category
	}

	for (const post of posts) {
		// 重复路径检测
		if (existedPath.has(post.path))
			console.warn('文章存在重复路径', post.path)
		existedPath.set(post.path, true)

		// 文章/总字数计数
		stats.total.posts++
		stats.total.words += post.readingTime.words

		// 年文章/年字数计数
		const date = parseArticleDate(post.date)
		if (date) {
			const year = Number(formatInTimeZone(date, blogConfig.timezone, 'yyyy'))
			const annual = stats.annual[year] ??= { posts: 0, words: 0 }
			annual.posts++
			annual.words += post.readingTime.words
		}

		// 分类文章计数
		const categories = post.categories || []
		let currentLevel = stats.categories

		for (const [index, categoryName] of categories.entries()) {
			if (typeof categoryName !== 'string')
				continue

			const category = findOrCreateCategory(categoryName, currentLevel)
			category.posts++

			if (index < categories.length - 1) {
				if (!category.children)
					category.children = []
				currentLevel = category.children
			}
		}

		// 标签统计
		const tags = post.tags || []
		tags.filter((tag: any): tag is string => typeof tag === 'string')
			.forEach((tag: string) => {
				if (!stats.tags.includes(tag))
					stats.tags.push(tag)
			})
	}

	return stats
})
