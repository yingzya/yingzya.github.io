import type { MinimarkNode, MinimarkTree, TocLink } from '@nuxt/content'
import type { ArticleSlot } from '../app/types/article'

/** 在公式和高亮处理完成后，把侧栏和许可块从正文移到文章元数据。 */
export function extractArticleSlots(body: MinimarkTree & { toc?: { links: TocLink[] } }) {
	const slots: Record<string, ArticleSlot> = {}
	const movedHeadings = new Set<string>()

	function collectMovedHeadings(node: MinimarkNode) {
		if (typeof node === 'string')
			return

		const [tag, props, ...children] = node
		if (/^h[1-6]$/.test(tag) && typeof props.id === 'string')
			movedHeadings.add(props.id)
		children.forEach(collectMovedHeadings)
	}

	body.value = body.value.filter((node) => {
		if (!Array.isArray(node) || !/^meta-(?:copyright$|aside-[\w-]+$)/.test(node[0]))
			return true

		const [tag, props, ...children] = node
		slots[tag.slice(5)] = { type: 'minimark', props, value: children }
		children.forEach(collectMovedHeadings)
		return false
	})

	function removeMovedHeadings(links: TocLink[]): TocLink[] {
		return links.flatMap((link) => {
			const children = link.children && removeMovedHeadings(link.children)
			return movedHeadings.has(link.id) ? (children ?? []) : [{ ...link, children }]
		})
	}

	if (body.toc && movedHeadings.size)
		body.toc.links = removeMovedHeadings(body.toc.links)
	return slots
}
