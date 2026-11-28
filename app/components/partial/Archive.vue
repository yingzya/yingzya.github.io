<script setup lang="ts">
import type ArticleProps from '~/types/article'
import { format } from 'date-fns'

const props = defineProps<{
	to?: string
	useUpdated?: boolean
	hideAuxDate?: boolean
} & ArticleProps>()

const appConfig = useAppConfig()
const category = computed(() => props.categories?.[0])
const categoryColor = computed(() => category.value && appConfig.article.categories[category.value]?.color)
const mainDate = computed(() => props.useUpdated ? props.updated : props.date)
const dateLabel = computed(() => mainDate.value
	? format(new Date(mainDate.value), 'MM-dd')
	: '')
const auxDateLabel = computed(() => props.date
	? format(new Date(props.date), isSameYear(props.updated, props.date) ? 'MM-dd' : 'yyyy-MM-dd')
	: '')
</script>

<template>
<li class="article-item">
	<time :datetime="getLocaleDatetime(mainDate)" :title="getLocaleDatetime(mainDate)">{{ dateLabel }}</time>
	<ZRawLink class="article-link gradient-card" :to :data-article-path="to ?? path" :title="description" :style="{ '--c-accent': categoryColor }">
		<span class="article-title">
			<span v-if="category" class="article-category" role="img" :aria-label="`分类：${category}`" :title="category">
				<Icon :name="getCategoryIcon(category)" aria-hidden="true" />
			</span>
			{{ title }}
		</span>
		<time v-if="useUpdated && !hideAuxDate && isTimeDiffSignificant(date, updated)" class="aux-date" :datetime="getLocaleDatetime(date)" :title="getLocaleDatetime(date)">
			&nbsp;{{ auxDateLabel }}</time>
		<small v-if="tags?.length" class="archive-tags">
			<span v-for="tag in tags" :key="tag">#{{ tag }}</span>
		</small>
		<NuxtImg v-if="image" class="article-cover" :src="image" :alt="title" loading="lazy" />
	</ZRawLink>
</li>
</template>

<style lang="scss" scoped>
.article-item {
	display: flex;
	align-items: center;
	gap: 0.5em;
	margin: var(--archive-row-gap, 0.2em) 0;
	transition: all 0.2s;
	animation: float-in 0.2s var(--delay) backwards;

	@media (max-width: $breakpoint-mobile) {
		font-size: 0.9em;
	}

	time {
		display: inline-block;
		opacity: 0.4;
		font-family: var(--font-monospace);
		transition: opacity 0.2s;

		&.aux-date {
			font-size: 0.8em;
			vertical-align: middle;
		}
	}

	&:hover > time {
		opacity: 1;
	}
}

.article-title {
	color: var(--c-text);
}

.archive-tags {
	display: inline-flex;
	flex-wrap: wrap;
	gap: 0 0.5em;
	margin-inline-start: 0.7em;
	color: var(--c-text-2);
}

.article-category {
	margin-inline-end: 0.25em;
	color: color-mix(in srgb, var(--c-accent) 65%, var(--c-text));
}

.article-link {
	flex-grow: 1;
	overflow: hidden;
	overflow-wrap: anywhere;
	min-width: 0;
	padding: calc(var(--archive-row-gap, 0.2em) + 0.1em) 0.6em;
}

.article-cover {
	position: absolute;
	opacity: 0.8;
	top: 0;
	inset-inline-end: 0;
	width: min(50%, 180px);
	height: 100%;
	margin: 0;
	mask-image: linear-gradient(to var(--end), transparent, #FFF7);
	transition: all 0.2s;
	object-fit: cover;
	z-index: -1;

	:hover > & {
		opacity: 1;
		width: 50%;
		object-position: center 43.5%;
	}
}
</style>
