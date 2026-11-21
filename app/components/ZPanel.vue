<script setup lang="ts">
const layoutStore = useLayoutStore()
const hasAside = computed(() => layoutStore.asideWidgets?.length)
const anchor = useTemplateRef<HTMLElement>('panel-anchor')
const offset = useAvoidOffset(anchor)

useEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		layoutStore.closeAll()
	}
})
</script>

<template>
<div ref="panel-anchor" class="panel-anchor">
	<div
		id="z-panel"
		:class="{ 'has-active': layoutStore.isAnyOpen }"
		:style="{ transform: offset ? `translateY(-${offset}px)` : undefined }"
	>
		<button
			id="toggle-sidebar"
			:class="{ active: layoutStore.isOpen('sidebar') }"
			aria-label="切换菜单"
			@click="layoutStore.toggle('sidebar')"
		>
			<Icon class="rtl-flip" name="ph:sidebar-duotone" />
		</button>
		<button
			v-if="hasAside"
			id="toggle-aside"
			:class="{ active: layoutStore.isOpen('aside') }"
			aria-label="切换侧边栏"
			@click="layoutStore.toggle('aside')"
		>
			<Icon class="rtl-flip" name="ph:align-right-duotone" />
		</button>
	</div>
</div>
</template>

<style lang="scss" scoped>
.panel-anchor {
	position: fixed;
	inset-inline-end: min(2rem, 5%);
	bottom: min(2rem, 5%);
	pointer-events: none;
	z-index: 100;

	@media (min-width: $breakpoint-widescreen) {
		display: none;
	}
}

#z-panel {
	overflow: hidden;
	border-radius: 0.5rem;
	background-color: var(--c-bg-a50);
	backdrop-filter: blur(0.5rem);
	font-size: 1.4rem;
	pointer-events: auto;

	@media (max-height: $breakpoint-phone) {
		display: flex;
	}

	@media (prefers-reduced-motion: no-preference) {
		transition: transform 0.1s;
	}

	&.has-active {
		box-shadow: 0 0 0.5rem var(--ld-shadow);
	}
}

#toggle-sidebar, #toggle-search {
	display: none;

	@media (max-width: $breakpoint-mobile) {
		display: block;
	}
}

button {
	display: block;
	padding: 0.5rem;
	transition: all 0.2s;

	&:hover {
		background-color: var(--c-bg-a80);
		color: var(--c-primary);
	}

	&.active {
		background-color: var(--ld-bg-active);
		color: var(--c-primary);
	}
}
</style>
