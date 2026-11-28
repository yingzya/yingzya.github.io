<script setup lang="ts">
import type { MinimarkNode } from '@nuxt/content'
import type ArticleProps from '~/types/article'

const route = useRoute()

const layoutStore = useLayoutStore()
layoutStore.setAside(['toc'])

const { data: post } = await useArticleContent()

const contentStore = useContentStore()
const { meta } = storeToRefs(contentStore)
const articleMeta = computed(() => post.value?.meta as ArticleProps['meta'])
meta.value = articleMeta.value

const excerpt = computed(() => post.value?.description || '')

function containsMath(node: MinimarkNode): boolean {
	if (typeof node === 'string')
		return false
	const [tag, props, ...children] = node
	return (tag === 'span' && Array.isArray(props.className) && props.className.includes('katex'))
		|| children.some(containsMath)
}

useHead(() => ({
	link: post.value?.body.value.some(containsMath)
		|| Object.values(articleMeta.value?.slots ?? {}).some(slot => slot.value.some(containsMath))
		? [{ rel: 'stylesheet', href: '/vendor/katex/katex.min.css' }]
		: [],
}))

if (post.value) {
	useSeoMeta({
		title: post.value.title,
		ogType: 'article',
		ogImage: post.value.image,
		description: post.value.description,
	})
	layoutStore.setAside(post.value.meta?.aside as WidgetName[])
}
else {
	// 该路由不参与预渲染，真正的 404 状态码只能由静态服务器返回
	// （nginx 配置见 README「部署 → 静态托管需返回真实 404」）。
	// 此处保证回退页本身带正确的标题且不被搜索引擎收录。
	// 注：曾在此调用 setResponseStatus(event, 404)，会导致部分文章在
	// Vercel / Linux SSG 模式下呈现异常，故不在应用层设置状态码。
	useSeoMeta({
		title: '内容为空或页面不存在',
		robots: 'noindex, nofollow',
	})
	route.meta.title = '404'
	layoutStore.setAside(['blog-log'])
}
</script>

<template>
<template v-if="post">
	<PostHeader v-bind="post" />
	<PostExcerpt v-if="excerpt" :excerpt />
	<ContentRenderer
		class="article"
		:class="getPostTypeClassName(post?.type, { prefix: 'md' })"
		:value="post"
		tag="article"
	/>

	<PostFooter v-bind="post" />
	<PostSurround />
	<PostComment />
</template>

<ZError
	v-else
	icon="solar:confounded-square-bold-duotone"
	title="内容为空或页面不存在"
/>
</template>
