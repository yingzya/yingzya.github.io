import { defineCollection, z } from '@nuxt/content'
import { asSitemapCollection } from '@nuxtjs/sitemap/content'
import blogConfig from './blog.config'

const articleSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	date: z.string().optional(),
	updated: z.string().optional(),
	categories: z.array(z.string()).default([blogConfig.defaultCategory]),
	tags: z.array(z.string()).default([]),
	type: z.enum(['tech', 'story']).optional(),

	image: z.string().optional(),
	recommend: z.number().optional(),
	references: z.array(z.object({
		title: z.string().optional(),
		link: z.string().optional(),
	})).optional(),
	draft: z.boolean().default(false),
	url: z.string().optional(),

	/** 声明后 @nuxt/content 会注入 Markdown 原文，供"复制 Markdown"等 AI 功能使用 */
	rawbody: z.string().optional(),

	readingTime: z.object({
		text: z.string(),
		minutes: z.number(),
		time: z.number(),
		words: z.number(),
	}),
})

export const collections = {
	content: defineCollection(asSitemapCollection({
		source: {
			include: '**',
			// 排除编辑器产生的非内容文件。@nuxt/content 以 dot: true 匹配 glob，
			// 若不过滤，Obsidian 的 .obsidian/*.json 会被解析成内容页
			exclude: ['**/.obsidian', '**/.obsidian/**'],
		},
		type: 'page',
		schema: articleSchema,
	})),
}
