import blogConfig from '~~/blog.config'

// https://llmstxt.org/ 规范：为 LLM 爬虫提供站点内容索引
export default defineEventHandler(async (event) => {
	const posts = await queryCollection(event, 'content')
		.where('stem', 'LIKE', 'posts/%')
		.order('date', 'DESC')
		.all()

	const getUrl = (path: string | undefined) => new URL(path ?? '', blogConfig.url).toString()

	const articles = posts.map((post) => {
		const desc = (post.description as string | undefined)?.trim()
		return `- [${post.title}](${getUrl(post.path)})${desc ? `: ${desc}` : ''}`
	})

	return [
		`# ${blogConfig.title}`,
		'',
		`> ${blogConfig.description}`,
		'',
		`- 作者: [${blogConfig.author.name}](${blogConfig.author.homepage})`,
		`- 订阅: [Atom Feed](${getUrl('atom.xml')})`,
		`- 许可: [${blogConfig.copyright.abbr}](${blogConfig.copyright.url})`,
		'',
		'## 文章',
		'',
		...articles,
		'',
	].join('\n')
})
