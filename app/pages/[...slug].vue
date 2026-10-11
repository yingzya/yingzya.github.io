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
