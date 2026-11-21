import type { Raw, VNode } from 'vue'

interface PopoverState {
	vnode: VNode
	duration: number
	show: Ref<boolean>
	zIndex: number
}

export interface PopoverOptions {
	duration?: number
	unique?: boolean
}

export const usePopoverStore = defineStore('popover', () => {
	const pops = ref<Raw<PopoverState>[]>([])
	let nextZIndex = 100
	const use = (render: () => VNode, options?: PopoverOptions) => {
		let state: PopoverState | undefined
		let pendingClose: symbol | undefined

		async function open() {
			if (state) {
				if (pendingClose) {
					pendingClose = undefined
					state.show.value = true
				}
				return
			}
			const vnode = render()
			if (options?.unique && pops.value.some(pop => pop.vnode.type === vnode.type))
				return
			const show = ref(false)
			state = {
				vnode,
				show,
				duration: options?.duration ?? 200,
				zIndex: nextZIndex++,
			}
			pops.value.push(state)
			Object.assign(vnode.props ??= {}, {
				style: { '--delay': `${state.duration}ms` },
				onClose: vnode.props?.onClose ?? close,
				onVnodeMounted: () => (show.value = !pendingClose),
			})
		}

		async function close() {
			if (!state || pendingClose)
				return
			const closing = Symbol('close popover')
			pendingClose = closing
			state.show.value = false
			await delay(state.duration)
			if (pendingClose === closing) {
				const index = pops.value.indexOf(state)
				if (index >= 0)
					pops.value.splice(index, 1)
				state = undefined
				pendingClose = undefined
			}
		}

		return { open, close }
	}

	return {
		pops,
		use,
	}
})
