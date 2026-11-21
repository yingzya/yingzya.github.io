<script setup lang="ts">
import { Icon } from '#components'

const props = defineProps<{
	code?: string
	copy?: boolean
}>()

const codeElement = useTemplateRef('code')
const CopyButton = defineComponent(() => {
	const { copy, copied } = useCopy(codeElement)
	return () => h('button', {
		'type': 'button',
		'aria-label': copied.value ? '已复制' : '复制行内代码',
		'title': copied.value ? '已复制' : '复制行内代码',
		'onClick': () => copy(props.code),
	}, [h(Icon, { name: copied.value ? 'ph:check-bold' : 'ph:copy-bold' })])
})
</script>

<template>
<code ref="code" class="shiki"><slot>{{ code }}</slot><CopyButton v-if="copy" class="copy-button" /></code>
</template>

<style lang="scss" scoped>
code {
	margin: 0.1em;
	padding: 0.1rem 0.3em;
	border: 1px solid var(--c-border);
	border-radius: 4px;
	background-color: var(--c-bg-2);
	font-size: 0.8125em;
	white-space: break-spaces;

	@supports (color: color-mix(in srgb, transparent, transparent)) {
		border-color: color-mix(in srgb, currentcolor 10%, transparent);
		background-color: color-mix(in srgb, currentcolor 5%, transparent);
	}
}

.copy-button {
	display: inline-flex;
	align-items: center;
	margin-inline-start: 0.25em;
	padding: 0.1em;
	border-radius: 0.2em;
	vertical-align: text-bottom;
	color: var(--c-text-2);

	&:hover, &:focus-visible {
		color: var(--c-primary);
	}
}
</style>
