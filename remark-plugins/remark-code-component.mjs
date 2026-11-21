import { visit } from 'unist-util-visit'

const components = new Map([
	['mermaid', { tag: 'mermaid', prop: 'code' }],
	['music-abc', { tag: 'music-score', prop: 'abc' }],
])

// 只转换对应组件的围栏，其余语言继续交给构建期的 Shiki。
export default function remarkCodeComponent() {
	return (tree) => {
		visit(tree, 'code', (node, index, parent) => {
			const component = components.get(node.lang?.toLowerCase())
			if (!component || index === undefined || !parent)
				return

			parent.children[index] = {
				type: 'paragraph',
				children: [],
				data: { hName: component.tag, hProperties: { [component.prop]: node.value } },
			}
		})
	}
}
