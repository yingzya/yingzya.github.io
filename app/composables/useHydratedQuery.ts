/** 静态页面先使用预渲染时的查询值，挂载后再读取浏览器地址栏。 */
export function useHydratedQuery<T>(name: string, source: Ref<T>): Ref<T> {
	if (import.meta.client && !useNuxtApp().isHydrating)
		return source

	const route = useRoute()
	const initial = useState<{ value: T }>(`query:${route.path}:${name}`, () => ({ value: source.value }))
	const mounted = useMounted()

	return computed({
		get: () => mounted.value ? source.value : initial.value.value,
		set: (value) => { source.value = value },
	})
}
