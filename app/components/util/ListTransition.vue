<script setup lang="ts" generic="T">
const props = defineProps<{ items: T[] }>()
const outer = useTemplateRef('outer')
const inner = useTemplateRef('inner')
const reducedMotion = usePreferredReducedMotion()
let animations: Animation[] = []
let revision = 0

function stop() {
	revision++
	for (const animation of animations)
		animation.cancel()
	animations = []
	if (outer.value) {
		outer.value.style.height = ''
		delete outer.value.dataset.changing
	}
}

function visible(rect: DOMRect) {
	return rect.bottom > 0 && rect.top < window.innerHeight
}

watch(() => props.items, async () => {
	const container = outer.value
	const content = inner.value
	if (!container || !content)
		return

	if (reducedMotion.value === 'reduce' || !container.animate || document.documentElement.hasAttribute('data-article-transition')) {
		stop()
		container.dataset.updated = ''
		return
	}

	const rows = () => Array.from(content.querySelectorAll<HTMLElement>('[data-list-key]'))
	// 连续排序时先记录动画当前位置，再取消上一轮。
	const before = new Map(rows().map(row => [row.dataset.listKey, row.getBoundingClientRect()]))
	const height = container.getBoundingClientRect().height
	stop()
	const current = revision
	container.dataset.updated = ''
	container.style.height = `${height}px`
	container.dataset.changing = ''

	await nextTick()
	if (current !== revision)
		return
	const target = content.getBoundingClientRect().height
	const after = rows().map(row => ({ row, rect: row.getBoundingClientRect() }))
	const timing = { duration: 220, easing: 'ease-out' }
	if (Math.abs(target - height) > 0.5)
		animations.push(container.animate([{ height: `${height}px` }, { height: `${target}px` }], { ...timing, fill: 'forwards' }))

	for (const { row, rect } of after) {
		if (!visible(rect))
			continue
		const from = before.get(row.dataset.listKey)
		if (from && visible(from)) {
			const x = from.left - rect.left
			const y = from.top - rect.top
			if (Math.abs(x) + Math.abs(y) > 0.5)
				animations.push(row.animate([{ translate: `${x}px ${y}px` }, { translate: '0 0' }], timing))
		}
		else {
			animations.push(row.animate([{ opacity: 0, translate: '0 8px' }, { opacity: 1, translate: '0 0' }], timing))
		}
	}
	await Promise.allSettled(animations.map(animation => animation.finished))
	if (current === revision)
		stop()
})

watch(reducedMotion, value => value === 'reduce' && stop())
onBeforeUnmount(stop)
</script>

<template>
<div ref="outer" class="list-transition">
	<div ref="inner" class="list-content">
		<slot :items />
	</div>
</div>
</template>

<style lang="scss" scoped>
.list-content {
	display: flow-root;
}

.list-transition[data-changing] {
	overflow: clip;
	overflow-anchor: none;
}

.list-transition[data-updated] :deep([data-list-key]) {
	animation: none;
}

@media (prefers-reduced-motion: reduce) {
	.list-transition :deep([data-list-key]) {
		animation: none;
	}
}
</style>
