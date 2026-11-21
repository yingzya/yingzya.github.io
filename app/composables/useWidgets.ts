import type { Component } from 'vue'
import type { ArticleSlot } from '~/types/article'
import type ArticleProps from '~/types/article'
import {
	LazyWidgetBlogLog,
	LazyWidgetBlogStats,
	LazyWidgetBlogTech,
	// LazyWidgetCommGroup,
	LazyWidgetEmpty,
	LazyWidgetGithubCard,
	LazyWidgetToc,
} from '#components'
import { pascal } from 'radash'

// @keep-sorted
const rawWidgets = {
	LazyWidgetBlogLog,
	LazyWidgetBlogStats,
	LazyWidgetBlogTech,
	// LazyWidgetCommGroup,
	LazyWidgetEmpty,
	LazyWidgetGithubCard,
	LazyWidgetToc,
}

type RawWidgetName = keyof typeof rawWidgets

/** 若首字母大写还需移除`-`前缀 */
type KebabCase<S extends string> = S extends `${infer First}${infer Rest}`
	? `${First extends Capitalize<First> ? '-' : ''}${Lowercase<First>}${KebabCase<Rest>}`
	: ''

type RemovePrefix<S extends string, Prefix extends string> = S extends `${Prefix}${infer Rest}` ? Rest : S

export type WidgetName = RemovePrefix<KebabCase<RawWidgetName>, '-lazy-widget-'> | `meta-aside-${string}`

export default function useWidgets(widgetList: MaybeRefOrGetter<WidgetName[]>) {
	const contentStore = useContentStore()
	const widgets = computed(() => (toValue(widgetList) || []).flatMap((name): Array<{
		name: WidgetName
		comp?: Component
		content?: ArticleSlot
	}> => {
		if (name.startsWith('meta-aside-')) {
			const content = (contentStore.meta as ArticleProps['meta'])?.slots?.[name.slice(5)]
			return content ? [{ name, content }] : []
		}
		const comp = rawWidgets[`LazyWidget${pascal(name)}` as RawWidgetName]
		return comp ? [{ name, comp }] : []
	}))
	return {
		widgets,
	}
}
