function visibleArticle(path: string, selector = '[data-article-path]') {
	const pathname = normalizeContentPath(path)
	return Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
		const articlePath = element.dataset.articlePath
		if (!articlePath || normalizeContentPath(new URL(articlePath, window.location.origin).pathname) !== pathname)
			return false
		const rect = element.getBoundingClientRect()
		return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
			&& rect.right > 0 && rect.left < window.innerWidth && getComputedStyle(element).visibility !== 'hidden'
	})
}

export default defineNuxtPlugin((nuxtApp) => {
	if (!document.startViewTransition)
		return

	const router = useRouter()
	const root = document.documentElement
	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
	const positions = new Map<number, { left: number, top: number }>()
	let position = window.history.state?.position as number
	let nativeNavigation = false
	let active: { path: string, cancel: () => void } | undefined

	useEventListener(window, 'popstate', (event) => {
		nativeNavigation = event.hasUAVisualTransition
	})
	const removeBefore = router.beforeEach(() => active?.cancel())
	const removeResolve = router.beforeResolve((to, from) => {
		const nextPosition = window.history.state?.position as number
		const isPop = nextPosition !== position
		positions.set(position, { left: window.scrollX, top: window.scrollY })
		if (nuxtApp.isHydrating || nativeNavigation || reducedMotion.matches || normalizeContentPath(to.path) === normalizeContentPath(from.path)
			|| to.hash || from.hash || document.querySelector('#z-panel.has-active, #z-lightbox-bgmask')) {
			return
		}
		const scrollToTop = typeof to.meta.scrollToTop === 'function' ? to.meta.scrollToTop(to, from) : to.meta.scrollToTop
		if (scrollToTop === false)
			return

		const source = visibleArticle(to.path, 'a[data-article-path]')
			?? (isPop ? visibleArticle(from.path, '.post-header[data-article-path]') : undefined)
		if (!source)
			return

		const scroll = isPop ? positions.get(nextPosition) ?? window.history.state?.scroll : undefined
		let resume!: () => void
		let finish!: () => void
		let transition: ViewTransition | undefined
		let target: HTMLElement | undefined
		const navigationReady = new Promise<void>((resolve) => {
			resume = resolve
		})
		const pageReady = new Promise<void>((resolve) => {
			finish = resolve
		})
		const removePage = nuxtApp.hook('page:loading:end', () => {
			if (router.currentRoute.value.fullPath === to.fullPath)
				finish()
		})
		const state = { path: to.fullPath, cancel }
		const timeout = window.setTimeout(cancel, 1500)
		function cleanup() {
			clearTimeout(timeout)
			removePage()
			if (active !== state)
				return
			source?.removeAttribute('data-article-shared')
			target?.removeAttribute('data-article-shared')
			delete root.dataset.articleTransition
			active = undefined
		}
		function cancel() {
			transition?.skipTransition()
			resume()
			finish()
			cleanup()
		}

		active = state
		root.dataset.articleTransition = ''
		source.dataset.articleShared = ''
		try {
			transition = document.startViewTransition(async () => {
				resume()
				await pageReady
				await nextTick()
				if (active !== state)
					return
				clearTimeout(timeout)
				// Nuxt 的滚动恢复在下一帧执行，快照捕获期间先对齐到相同位置。
				window.scrollTo({ left: scroll?.left ?? 0, top: scroll?.top ?? 0, behavior: 'instant' })
				source.removeAttribute('data-article-shared')
				target = visibleArticle(to.path) ?? visibleArticle(from.path)
				if (target)
					target.dataset.articleShared = ''
			})
			transition.ready.catch(cancel)
			transition.finished.then(cleanup, cleanup)
		}
		catch {
			cancel()
		}
		return navigationReady
	})
	const removeAfter = router.afterEach((to, _from, failure) => {
		if (failure && active?.path === to.fullPath)
			active.cancel()
		position = window.history.state?.position as number
		nativeNavigation = false
	})
	const removeError = router.onError(() => active?.cancel())
	const removeAppError = nuxtApp.hook('app:error', () => active?.cancel())
	nuxtApp.vueApp.onUnmount(() => {
		active?.cancel()
		removeBefore()
		removeResolve()
		removeAfter()
		removeError()
		removeAppError()
	})
})
