<script setup lang="ts">
const props = defineProps<{ code: string }>()
const colorMode = useColorMode()
const container = useTemplateRef('container')
const visible = useElementVisibility(container, { rootMargin: '300px' })
const ready = ref(false)
const fitWidth = ref(false)
const { width: containerWidth } = useElementSize(container)
whenever(visible, () => ready.value = true, { once: true })

const id = useId()
let revision = 0
const diagram = computedAsync(async () => {
	const code = props.code
	const theme = colorMode.value === 'dark' ? 'dark' : 'default'
	if (!import.meta.client || !ready.value)
		return

	try {
		const { default: mermaid } = await import('mermaid')
		mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', suppressErrorRendering: true, theme })
		const { svg } = await mermaid.render(`mermaid-${id}-${revision++}`, code)
		const image = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('svg')
		return { svg, width: image?.viewBox.baseVal.width }
	}
	catch (error) {
		return { error: error instanceof Error ? error.message : '无法显示图表。' }
	}
})
</script>

<template>
<div ref="container" class="mermaid-diagram">
	<template v-if="diagram?.svg">
		<button
			v-if="diagram.width && containerWidth && diagram.width > containerWidth"
			type="button" class="width-toggle" :aria-pressed="fitWidth"
			@click="fitWidth = !fitWidth"
		>
			{{ fitWidth ? '横向滚动' : '适应宽度' }}
		</button>
		<div class="scrollcheck-x diagram-scroll" role="region" aria-label="Mermaid 图表" tabindex="0">
			<div :style="{ minWidth: !fitWidth && diagram.width ? `${diagram.width}px` : undefined }" v-html="diagram.svg" />
		</div>
	</template>
	<template v-else>
		<details v-if="diagram?.error">
			<summary>图表渲染失败，查看原因</summary>
			<pre>{{ diagram.error }}</pre>
		</details>
		<pre class="diagram-source"><code>{{ code }}</code></pre>
	</template>
</div>
</template>

<style lang="scss" scoped>
.mermaid-diagram {
	margin: 1em 0;

	:deep(svg) {
		display: block;
		height: auto;
		margin-inline: auto;
	}

	:deep(p) {
		margin: 0;
	}
}

.diagram-scroll, .diagram-source {
	overflow-x: auto;
}

.width-toggle {
	display: block;
	margin: 0 0 0.4em auto;
	padding: 0.25em 0.55em;
	border-radius: 0.4em;
	background-color: var(--c-bg-2);
	font-size: 0.8em;
	color: var(--c-text-2);
}

.diagram-source {
	padding: 1em;
	border-radius: 0.5em;
	background-color: var(--c-bg-2);
}

details pre {
	overflow-wrap: anywhere;
	white-space: pre-wrap;
}
</style>
