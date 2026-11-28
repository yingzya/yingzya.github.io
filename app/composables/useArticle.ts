import type ArticleProps from '~/types/article'
import type { ArticleOrderType } from '~/types/article'
import { alphabetical } from 'radash'

export function useArticleContent() {
	const route = useRoute()
	const path = computed(() => normalizeContentPath(route.path))
	return useAsyncData(path, () => queryCollection('content').path(path.value).first(), { dedupe: 'defer' })
}

export function useArticleIndex(path = 'posts/%') {
	return useAsyncData(
		// key 会被 Nuxt 写入 `shared_<key>` 缓存，而 Nitro 的缓存驱动会对该 key
		// 做 decodeURIComponent。LIKE 模式里的 `%` 会让它抛 "URI malformed"
		// 并导致预渲染失败，因此这里先做 URI 编码（同时保证不同模式 key 不冲突）
		`index_${encodeURIComponent(path)}`,
		() => queryCollection('content')
			.where('stem', 'LIKE', path)
			.select('categories', 'date', 'description', 'image', 'path', 'readingTime', 'recommend', 'tags', 'title', 'type', 'updated')
			.all(),
		{ default: () => [] }, // 不返回 undefined
	)
}

interface UseCategoryOptions {
	bindQuery?: string | false
}

export function useCategory(list: MaybeRefOrGetter<ArticleProps[]>, options?: UseCategoryOptions) {
	const { bindQuery } = options ?? {}
	const category = bindQuery
		? useHydratedQuery(bindQuery, useRouteQuery(bindQuery, undefined, {
				transform: (value: unknown) => typeof value === 'string' ? value : undefined,
				mode: 'push',
			}))
		: ref<string | undefined>()
	const categories = computed(() => [...new Set(toValue(list).map(item => item.categories?.[0]))])
	const listCategorized = computed(
		() => toValue(list).filter(
			item => !category.value || item.categories?.[0] === category.value,
		),
	)

	return {
		category,
		categories,
		listCategorized,
	}
}

interface UseArticleSortOptions {
	bindOrderQuery?: string
	bindDirectionQuery?: string
}

export function useArticleSort(list: MaybeRefOrGetter<ArticleProps[]>, options: UseArticleSortOptions = {}) {
	const appConfig = useAppConfig()
	const initialOrder: ArticleOrderType = appConfig.pagination.sortOrder || 'date'
	const { bindOrderQuery, bindDirectionQuery } = options
	function parseOrder(value: unknown): ArticleOrderType {
		return typeof value === 'string' && Object.hasOwn(appConfig.article.order, value)
			? value as ArticleOrderType
			: initialOrder
	}
	const sortOrder = bindOrderQuery
		? useHydratedQuery(bindOrderQuery, useRouteQuery<string, ArticleOrderType>(bindOrderQuery, initialOrder, { transform: parseOrder }))
		: ref<ArticleOrderType>(initialOrder)
	const isAscending = bindDirectionQuery
		? useHydratedQuery(bindDirectionQuery, useRouteQuery<string, boolean>(bindDirectionQuery, 'false', {
				transform: { get: value => value === 'true', set: String },
			}))
		: ref(false)
	const listSorted = computed(() => alphabetical(
		toValue(list),
		item => item[sortOrder.value] || '',
		isAscending.value ? 'asc' : 'desc',
	))
	return {
		sortOrder,
		isAscending,
		listSorted,
	}
}

export function getCategoryIcon(category?: string) {
	const appConfig = useAppConfig()
	return appConfig.article.categories[category!]?.icon ?? 'ph:folder-bold'
}

export function getPostTypeClassName(type?: string, options = {
	prefix: 'text',
}) {
	if (!type)
		type = 'tech'

	const { prefix } = options

	return `${prefix}-${type}`
}
