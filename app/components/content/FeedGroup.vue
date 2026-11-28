<script setup lang="ts">
import type { FeedEntry, FeedGroup } from '~/types/feed'
import { shuffle } from 'radash'

const props = defineProps<{
	label?: string
	feeds: FeedGroup[]
}>()

const route = useRoute()
const config = useAppConfig()
const shuffled = reactive(new Map<string, FeedEntry[]>())

function shuffleGroup(group: FeedGroup) {
	shuffled.set(group.name, shuffle(group.entries))
}

function reorderGroup(group: FeedGroup, event: MouseEvent) {
	if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
		shuffled.delete(group.name)
	else
		shuffleGroup(group)
}

// 等到水合后再随机排列，首屏始终使用构建时的顺序。
watch([useMounted(), () => route.query.shuffle, () => config.link.randomInGroup, () => props.feeds], ([mounted, query, defaultRandom]) => {
	shuffled.clear()
	if (mounted && (query === 'true' || (query !== 'false' && defaultRandom)))
		props.feeds.forEach(shuffleGroup)
}, { immediate: true })

// 友链浮现随机延迟
function getCardDelay(feed: FeedEntry) {
	let hash = 0
	for (const char of feed.link) {
		hash = hash * 31 + char.charCodeAt(0)
	}
	return (hash % 1000) / 1000
}
</script>

<template>
<h2 v-if="label" class="feed-label text-creative">
	{{ label }}
</h2>

<section v-for="group in feeds" :key="group.name" class="feed-group">
	<h3 class="feed-title">
		<button
			v-if="group.entries.length > 1"
			type="button"
			:title="`点击重新排列「${group.name}」，按住修饰键点击可恢复原序`"
			:aria-label="`重新排列${group.name}友链`"
			@click="reorderGroup(group, $event)"
		>
			{{ group.name }}
		</button>
		<span v-else>{{ group.name }}</span>
	</h3>
	<p class="feed-desc">
		{{ group.desc }}
		<button v-if="shuffled.has(group.name) && group.entries.length > 1" type="button" class="restore-order" @click="shuffled.delete(group.name)">
			恢复原序
		</button>
	</p>
	<TransitionGroup tag="menu" class="feed-list" appear name="float-in">
		<li
			v-for="entry in shuffled.get(group.name) ?? group.entries"
			:key="entry.link"
			:style="`--delay: ${getCardDelay(entry)}s;`"
		>
			<FeedCard v-bind="entry" />
		</li>
	</TransitionGroup>
</section>
</template>

<style lang="scss" scoped>
.feed-label {
	margin: 2rem 1rem -1rem;
}

.feed-group {
	// position: relative;
	container-type: inline-size;
	margin: 2rem 1rem;
}

.feed-title {
	position: sticky;
	opacity: 0.5;
	top: 0;
	margin-bottom: -0.3em;
	mask-image: linear-gradient(#FFF 50%, transparent);
	font: 800 5em / 1 var(--font-stroke-free);
	text-align: center;
	color: transparent;
	transition: color 0.2s;
	pointer-events: none;
	-webkit-text-stroke: 1px var(--c-text-3);

	button {
		pointer-events: auto;
	}

	&::selection, :hover > & {
		color: var(--c-text-3);
	}
}

.feed-desc {
	text-align: center;
	color: var(--c-text-2);
}

.restore-order {
	margin-inline-start: 0.5em;
	text-decoration: underline;
}

.feed-list {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
	gap: 0.2rem 0.5rem;
	position: relative;
	margin: 1rem auto;

	@mixin feed-narrow {
		grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
		font-size: 0.9em;

		:deep(.feed-card) {
			flex-direction: column;
			text-align: center;

			.avatar.avatar {
				margin: 0 0 0.2rem;
			}
		}
	}

	@media (max-width: $breakpoint-phone) {
		@include feed-narrow;
	}

	@container (max-width: #{$breakpoint-phone}) {
		@include feed-narrow;
	}
}

:deep(.feed-card.feed-card) {
	width: auto;
	margin: 0;
}
</style>
