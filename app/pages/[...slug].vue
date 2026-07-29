<script setup lang="ts">
const route = useRoute()

const layoutStore = useLayoutStore()
layoutStore.setAside(['toc'])

const { data: post } = await useAsyncData(
	() => route.path,
	() => queryCollection('content').path(route.path).first(),
)

const contentStore = useContentStore()
const { toc, meta } = storeToRefs(contentStore)
toc.value = post.value?.body.toc
meta.value = post.value?.meta

const excerpt = computed(() => post.value?.description || '')

if (post.value) {
	useSeoMeta({
		title: post.value.title,
		ogType: 'article',
		ogImage: post.value.image,
		description: post.value.description,
	})
	// KaTeX CSS 仅含数学公式的文章加载，非数学页面不再全局引入
	if (post.value.rawbody && /\$\$/.test(post.value.rawbody)) {
		useHead({
			link: [{ rel: 'stylesheet', href: 'https://lib.baomitu.com/KaTeX/0.16.9/katex.min.css', media: 'print', onload: 'this.media="all"' }],
		})
	}
	layoutStore.setAside(post.value.meta?.aside as WidgetName[])
}
else {
	// // BUG: 部分文章在 Vercel 上以 404 状态码呈现，在 Linux SSG 模式下展示异常
	// const event = useRequestEvent()
	// event && setResponseStatus(event, 404)
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
