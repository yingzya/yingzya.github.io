const useAvoidTargets = createSharedComposable(() => shallowRef<HTMLElement[]>([]))

/** 注册需要保持可点击的控件，页面卸载时一起移除。 */
export function useAvoidTarget(element: Ref<HTMLElement | null>) {
	if (import.meta.server)
		return
	const targets = useAvoidTargets()
	watch(element, (target, _, onCleanup) => {
		if (!target)
			return
		targets.value = [...targets.value, target]
		onCleanup(() => {
			targets.value = targets.value.filter(item => item !== target)
		})
	}, { flush: 'post', immediate: true })
}

/** 测量固定的外层；只移动内层按钮，避免用变换后的坐标反复计算位移。 */
export function useAvoidOffset(anchor: Ref<HTMLElement | null>) {
	const offset = shallowRef(0)
	if (import.meta.server)
		return offset

	const targets = useAvoidTargets()
	const { resume: schedule } = useRafFn(() => {
		const origin = anchor.value?.getBoundingClientRect()
		let shift = 0
		if (origin?.width && origin.height) {
			for (const element of targets.value) {
				const rect = element.getBoundingClientRect()
				if (rect.right > origin.left && rect.left < origin.right
					&& rect.bottom > origin.top && rect.top < origin.bottom) {
					shift = Math.max(shift, origin.bottom - rect.top + 16)
				}
			}
		}
		offset.value = shift
	}, { immediate: false, once: true })

	watch(targets, schedule, { flush: 'post' })
	useResizeObserver(() => [anchor.value, document.documentElement, ...targets.value], schedule)
	useEventListener(window, 'scroll', schedule, { capture: true, passive: true })
	useEventListener(window, 'resize', schedule)
	useEventListener(window.visualViewport, ['scroll', 'resize'], schedule, { passive: true })
	return offset
}
