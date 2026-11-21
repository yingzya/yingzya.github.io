export default defineNuxtPlugin((nuxtApp) => {
	const url = new URL(window.location.href)
	const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
	if (!url.hash || navigation?.type === 'back_forward')
		return

	nuxtApp.hooks.hookOnce('app:suspense:resolve', async () => {
		await nextTick()
		requestAnimationFrame(() => {
			if (window.location.href !== url.href)
				return

			const id = safelyDecodeUriComponent(url.hash.slice(1))
			document.getElementById(id)?.scrollIntoView({ behavior: 'instant' })
		})
	})
})
