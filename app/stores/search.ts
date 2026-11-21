import { LazyPopoverSearch } from '#components'

export const useSearchStore = defineStore('search', () => {
	const layoutStore = useLayoutStore()
	const popoverStore = usePopoverStore()
	const word = ref('')
	const debouncedWord = refDebounced(word)

	function toggle() {
		layoutStore.toggle('search')
	}

	const { open, close } = popoverStore.use(() => h(LazyPopoverSearch))

	watch(() => layoutStore.isOpen('search'), (searchOpen) => {
		if (!searchOpen)
			return close()

		const selection = window.getSelection()?.toString().trim()
		if (selection)
			word.value = selection.slice(0, 160)
		open()
	})

	return {
		debouncedWord,
		word,
		toggle,
	}
})
