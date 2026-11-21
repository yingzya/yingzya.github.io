<script setup lang="ts">
const props = defineProps<{
	totalPages: number
}>()

const page = defineModel<number>({ required: true })
const pageArr = computed(() => genPageArr(page.value, props.totalPages))
const pagination = useTemplateRef<HTMLElement>('pagination')
const end = useTemplateRef<HTMLElement>('pagination-end')
const atEnd = useElementVisibility(end)
useAvoidTarget(pagination)
</script>

<template>
<nav
	ref="pagination"
	class="pagination"
	:class="{ 'sticky': totalPages > 1, 'at-end': atEnd }"
	:aria-label="`第${page}页，共${totalPages}页`"
>
	<ZButton
		:disabled="page <= 1"
		class="rtl-flip"
		icon="ph:arrow-fat-left-duotone"
		aria-label="上一页"
		@click="page--"
	/>
	<template v-for="i in pageArr" :key="i">
		<button
			v-if="Number.isFinite(i)"
			class="pagination-button"
			:class="{ active: i === page }"
			:aria-label="`第${i}页`"
			@click="page = i"
			v-text="i"
		/>
		<!-- TODO: 点击后自主选择目标页面 -->
		<span v-else class="pagination-ellipsis">…</span>
	</template>
	<ZButton
		:disabled="page >= totalPages"
		class="rtl-flip"
		icon="ph:arrow-fat-right-duotone"
		aria-label="下一页"
		@click="page++"
	/>
</nav>
<div ref="pagination-end" aria-hidden="true" />
</template>

<style lang="scss" scoped>
.pagination {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin: 1rem 0;
	font-variant-numeric: tabular-nums;

	@media (max-width: $breakpoint-mobile) {
		&.sticky {
			position: sticky;
			bottom: min(2rem, 5vh);
			z-index: 1;

			&:not(.at-end) {
				gap: 0.25em;
				width: fit-content;
				max-width: 100%;
				margin-inline: auto;
				padding: 0.2em;
				border-radius: 0.5rem;
				box-shadow: 0 2px 0.5em var(--ld-shadow);
				background-color: var(--ld-bg-card);
			}
		}
	}

	.pagination-ellipsis {
		opacity: 0.5;
		user-select: none;
	}

	.pagination-button {
		padding: 0.2em 0.5em;
		border-radius: 0.5em;
		transition: background-color 0.2s ease-in-out;
		cursor: pointer;

		&:hover {
			background-color: var(--c-border);
		}

		&.active {
			background-color: var(--c-border);
		}
	}
}
</style>
