<script setup lang="ts">
const props = defineProps<{
	title?: string
	description?: string
	path?: string
	rawbody?: string
}>()

const appConfig = useAppConfig()

const articleUrl = computed(() => new URL(props.path ?? '', appConfig.url).href)

/** 过滤掉 YAML frontmatter（@nuxt/content 的 rawbody 包含了文件全文） */
const cleanBody = computed(() => {
	const raw = props.rawbody?.trim() ?? ''
	return raw.replace(/^---[\s\S]*?---\n*/, '').trim()
})

const markdownText = computed(() => [
	`# ${props.title}`,
	'',
	cleanBody.value || props.description || '',
	'',
	`> 原文链接：${articleUrl.value}`,
	'',
].join('\n'))

const { copy, copied } = useClipboard({ source: markdownText, legacy: true })
</script>

<template>
<ZButton
	v-tip="copied ? '已复制到剪贴板' : '复制 Markdown 原文，可粘贴给 AI'"
	:icon="copied ? 'ph:check-bold' : 'ph:markdown-logo-bold'"
	@click="copy()"
>
	复制 Markdown
</ZButton>
</template>
