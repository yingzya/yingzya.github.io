#!/usr/bin/env node

import { exec } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { intro, log, outro, select, spinner, text } from '@clack/prompts'
import { customAlphabet } from 'nanoid'
import blogConfig from '../blog.config.ts'

function normalize(val: string | symbol | undefined): string | undefined {
	return typeof val === 'symbol' ? undefined : val?.trim()
}

// 参数
let fileName: string | undefined = process.argv[2]
const usePermalink = blogConfig.article.useRandomPremalink
const now = new Date()

const dir = path.join('content', 'posts', now.getFullYear().toString())

const absDir = path.join(process.cwd(), dir)
if (!fs.existsSync(absDir))
	fs.mkdirSync(absDir, { recursive: true })

intro(usePermalink ? '📝 使用中文名 + 随机 URL 新建文章' : '📝 使用指定文件名 + 年份 URL 新建文章')

if (fileName)
	log.info(`文件名: ${path.join(dir, fileName)}.md`)

const permalink = usePermalink
	? `/posts/${customAlphabet('1234567890abcdef', 7)()}`
	: undefined

do {
	if (fileName || usePermalink)
		break

	fileName = normalize(await text({
		message: `请输入文件名（将创建在 ${dir} 下）`,
		placeholder: `monthly-${now.getMonth() + 1}`,
		validate: val => val.trim() === '' ? '文件名不能为空' : undefined,
	}))
	if (!fileName)
		process.exit(0)

	if (fs.existsSync(path.join(absDir, `${fileName}.md`))) {
		log.error('❌ 文件已存在')
		fileName = undefined
	}
} while (!fileName)

let title = fileName

// 请求标题
do {
	if (title)
		break

	title = normalize(await text({
		message: '请输入博客标题',
		placeholder: `${now.getMonth() + 1}月生活`,
		validate: val => val.trim() === '' ? '标题不能为空' : undefined,
	}))
	if (!title)
		process.exit(0)

	if (usePermalink) {
		if (fs.existsSync(path.join(absDir, `${title}.md`))) {
			log.error('❌ 文件已存在')
			title = undefined
		}
	}
} while (!title)

const relPath = path.join(dir, `${usePermalink ? title : fileName}.md`)
if (!process.argv[2])
	log.info(`文件名: ${relPath}`)

const absPath = path.join(process.cwd(), relPath)
if (fs.existsSync(absPath)) {
	log.error('❌ 文件已存在')
	process.exit(1)
}

// 分类
let category = normalize(await select({
	message: '请选择分类',
	options: [
		...Object.keys(blogConfig.article.categories).map(c => ({ value: c, label: c })),
		{ value: 'custom', label: '自定义' },
	],
}))
if (!category)
	process.exit(0)

// 自定义分类
if (category === 'custom') {
	const customCategory = normalize(await text({
		message: '请输入自定义分类',
		validate: val => val.trim() === '' ? '分类不能为空' : undefined,
	}))
	if (!customCategory)
		process.exit(0)
	category = customCategory
}

// 标签
const tagsInput = normalize(await text({
	message: '请输入标签（多个用中英文逗号或空格分隔）',
	placeholder: 'Vue, Vite, TypeScript',
}))
const tags = tagsInput?.split(/[\s,，]+/).map(t => t.trim()).filter(Boolean)

// 样式类型
let type = normalize(await select({
	message: '选择文章类型',
	options: [
		{ value: 'tech', label: '技术 (tech)' },
		{ value: 'story', label: '故事 (story)' },
		{ value: 'custom', label: '自定义' },
	],
	initialValue: 'tech',
}))
if (!type)
	process.exit(0)
if (type === 'custom') {
	const customType = normalize(await text({
		message: '请输入自定义类型',
		validate: val => val.trim() === '' ? '类型不能为空' : undefined,
	}))
	if (!customType)
		process.exit(0)

	log.warn('⚠️ 新建分类后，建议在 blog.config.ts 中添加对应配置')
	type = customType
}

// frontmatter
const frontmatter = {
	title,
	description: `讲述关于${title}的故事，并根据${tags?.join('、') ?? ''}给出${category}。`,
	date: `${now.toLocaleDateString('en-CA')} ${now.toLocaleTimeString()}`,
	updated: `${now.toLocaleDateString('en-CA')} ${now.toLocaleTimeString()}`,
	image: '# 图片',
	permalink,
	type: type === 'tech' ? undefined : type,
	categories: category === blogConfig.defaultCategory ? undefined : `[${category}]`,
	tags: tags ? `[${tags.join(', ')}]` : undefined,
	// draft: 'true # 撰写完成后，请删除此行',
}

// 写文件
fs.writeFileSync(absPath, `---\n${Object.entries(frontmatter)
	.filter(([, value]) => value !== undefined)
	.map(([key, value]) => `${key}: ${value}`)
	.join('\n')}
---

## 从${title}说起

`, 'utf8')

log.info(`✅ 已创建: ${absPath}`)
if (permalink)
	log.info(`🔗 文章链接: ${new URL(permalink, blogConfig.url)}`)

// 打开 Typora
const s = spinner()
s.start('正在打开 Typora...')

exec(`typora "${absPath}"`, (error) => {
	if (!error)
		return
	s.stop('⚠️ 无法打开 Typora，请确认已将 Typora 添加到 PATH')
	log.error(error.message)
	process.exit(1)
})

s.stop('⌨ 已通过 Typora 打开文件')
outro(`🎉 开始书写吧！`)
