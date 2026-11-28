<script setup lang="ts">
import { group } from 'radash'

const appConfig = useAppConfig()
useSeoMeta({
	title: '归档',
	description: `${appConfig.title}的所有文章归档。`,
})
const birthYear = appConfig.component.stats.birthYear

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-log'])

const { data: listRaw } = await useArticleIndex()
const { listSorted, isAscending, sortOrder } = useArticleSort(listRaw)
const { category, categories, listCategorized } = useCategory(listSorted)
const compact = ref(false)
const settingsOpen = ref(false)
const columns = ref(1)
const showAuxDate = ref(true)
const preferredSpacing = ref(0.2)
const spacing = computed({
	get: () => compact.value ? 0 : preferredSpacing.value,
	set(value: number) {
		compact.value = value === 0
		if (value > 0)
			preferredSpacing.value = value
	},
})
const controls = useTemplateRef<HTMLElement>('archive-controls')
useAvoidTarget(controls)

const listGrouped = computed(() => {
	const groupList = Object.entries(group(
		listCategorized.value,
		article => new Date(article[sortOrder.value] || 0).getFullYear(),
	))
	return isAscending.value ? groupList : groupList.reverse()
})

// 不能使用 /api/stats，因为可能切换分组方式
const yearlyWordCount = computed(() => {
	return listGrouped.value.reduce<Record<string, string>>((acc, [year, yearGroup]) => {
		const totalWords = yearGroup?.reduce((sum, cur) => sum + cur.readingTime!.words, 0) || 0
		acc[year] = formatNumber(totalWords)
		return acc
	}, {})
})
</script>

<template>
<div
	class="archive"
	:class="{ compact }"
	:style="{ '--archive-row-gap': `${spacing}em`, '--archive-columns': columns }"
>
	<div ref="archive-controls" class="archive-controls">
		<div>
			<ZButton
				type="button"
				icon="ph:arrows-in-line-vertical-bold"
				text="紧凑排列"
				:aria-pressed="compact"
				:primary="compact"
				@click="compact = !compact"
			/>
			<ZButton
				type="button"
				icon="ph:sliders-horizontal-bold"
				aria-label="密度设置"
				title="密度设置"
				aria-controls="archive-density-settings"
				:aria-expanded="settingsOpen"
				@click="settingsOpen = !settingsOpen"
			/>
		</div>
		<ZOrderToggle
			v-model:is-ascending="isAscending"
			v-model:sort-order="sortOrder"
			v-model:category="category"
			:categories
		/>
		<div v-show="settingsOpen" id="archive-density-settings" class="archive-settings">
			<label>
				行间距
				<input v-model.number="spacing" type="range" min="0" max="0.6" step="0.1">
			</label>
			<label>
				最多列数
				<select v-model.number="columns">
					<option v-for="n in 8" :key="n" :value="n">{{ n }}</option>
				</select>
			</label>
			<label>
				<input v-model="showAuxDate" type="checkbox">
				按更新排序时显示创建日期
			</label>
		</div>
	</div>

	<UtilListTransition v-slot="{ items }" :items="listGrouped">
		<section
			v-for="[year, yearGroup] in items"
			:key="year"
			class="archive-group"
		>
			<div class="archive-title" :data-list-key="`year:${year}`">
				<h2 class="archive-year">
					{{ year }}
				</h2>

				<div class="archive-age">
					<span>{{ Number(year) - birthYear }}</span>
					<span class="age-label">岁</span>
				</div>

				<div class="archive-info">
					<span>{{ yearlyWordCount[year] }}字</span>
					<span>{{ yearGroup?.length }}篇</span>
				</div>
			</div>

			<menu class="archive-list" :class="{ columns: columns > 1 }">
				<ZArchive
					v-for="article, index in yearGroup"
					:key="article.path"
					v-bind="article"
					:data-list-key="article.path"
					:to="article.path"
					:use-updated="sortOrder === 'updated'"
					:hide-aux-date="!showAuxDate"
					:style="{ '--delay': `${index * 0.03}s` }"
				/>
			</menu>
		</section>
	</UtilListTransition>
</div>
</template>

<style lang="scss" scoped>
.archive {
	margin: 1rem;
	mask-image: linear-gradient(#FFF 50%, #FFF5);
}

.archive-controls {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 0.5rem;
}

.archive-group {
	margin: 1rem 0 3rem;
}

.archive-settings {
	display: flex;
	flex: 1 0 100%;
	flex-wrap: wrap;
	gap: 0.5em 1em;
	padding: 0.6em 0.8em;
	border-radius: 0.5em;
	background-color: var(--c-bg-2);
	font-size: 0.9em;

	label {
		display: flex;
		align-items: center;
		gap: 0.4em;
	}

	input, select {
		accent-color: var(--c-primary);
	}

	select {
		padding: 0.2em;
		border-radius: 0.3em;
		background-color: var(--ld-bg-card);
		font: inherit;
		color: inherit;
	}
}

.archive-list.columns {
	--archive-column-width: max(9.5rem, calc((100% + 0.5rem) / var(--archive-columns) - 0.5rem));

	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--archive-column-width)), 1fr));
	column-gap: 0.5rem;

	:deep(.archive-tags) {
		display: none;
	}

	:deep(.article-item) {
		display: grid;
		align-content: start;
		gap: 0;
		min-width: 0;
	}
}

.archive-title {
	display: flex;
	justify-content: space-between;
	gap: 1em;
	position: sticky;
	opacity: 0.5;
	top: 0;
	font-size: min(1.5em, 5vw);
	color: transparent;
	transition: color 0.2s;

	&::selection, :hover > & {
		color: var(--c-text-3);
	}

	:hover > & .archive-age {
		opacity: 0;
	}

	> .archive-year, .archive-age {
		margin-bottom: -0.3em;
		mask-image: linear-gradient(#FFF 50%, transparent);
		font: 800 3em / 1 var(--font-stroke-free);
		z-index: -1;
		-webkit-text-stroke: 1px var(--c-text-3);
	}

	> .archive-age {
		position: absolute;
		inset-inline-end: 0;
		transition: opacity 0.2s;

		> .age-label {
			font-size: 0.5em;
			vertical-align: super;
		}
	}

	> .archive-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		column-gap: 0.5em;
	}
}
</style>
