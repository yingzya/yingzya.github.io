import type { TocLink } from '@nuxt/content'

export function useTocAutoHighlight(toc: MaybeRefOrGetter<TocLink[]>) {
	const activeTocItem = ref<string | null>(null)
	let headings: { id: string, top: number }[] = []

	function updateActiveHeading() {
		const margin = Number.parseFloat(getComputedStyle(document.documentElement).scrollMarginTop) || 64
		const current = headings.find(heading => heading.top <= window.scrollY + margin + 1)
		activeTocItem.value = current?.id ?? null
	}

	function measureHeadings() {
		const offsets: typeof headings = []
		function collect(items: TocLink[]) {
			for (const item of items) {
				const heading = document.getElementById(item.id)
				if (heading)
					offsets.push({ id: item.id, top: window.scrollY + heading.getBoundingClientRect().top })
				if (item.children)
					collect(item.children)
			}
		}
		collect(toValue(toc))
		headings = offsets.reverse()
		updateActiveHeading()
	}

	if (import.meta.client) {
		onMounted(measureHeadings)
		watch(() => toValue(toc), measureHeadings, { flush: 'post' })
		useResizeObserver(document.body, measureHeadings)
		useEventListener(window, 'scroll', autoThrottleAndDebounce(updateActiveHeading), { passive: true })
		const removeHook = useNuxtApp().hook('page:finish', measureHeadings)
		onScopeDispose(removeHook)

		watch(activeTocItem, () => {
			const aside = document.getElementById('z-aside')
			const active = aside?.querySelector('.article-toc a[aria-current="location"]')
			if (!aside || !active)
				return
			const panel = aside.getBoundingClientRect()
			const link = active.getBoundingClientRect()
			if (link.top < panel.top || link.bottom > panel.bottom)
				aside.scrollTop += link.top - panel.top - aside.clientHeight / 4
		}, { flush: 'post' })
	}

	return { activeTocItem }
}
