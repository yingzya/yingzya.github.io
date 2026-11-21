import { visit } from 'unist-util-visit'

export default function remarkDemo() {
	const parse = this.parser
	this.parser = (document, file) => {
		const tree = parse(document, file)
		visit(tree, 'code', (node, index, parent) => {
			if (node.lang !== 'demo' || !parent || index === undefined)
				return

			// 两个视图都经过正常的 Markdown 管线，源码使用本站的构建期高亮。
			parent.children[index] = {
				type: 'containerComponent',
				name: 'demo',
				attributes: {},
				children: [
					...this.parse(node.value).children,
					{
						type: 'componentContainerSection',
						name: 'source',
						attributes: {},
						data: { hName: 'component-slot', hProperties: { 'v-slot:source': '' } },
						children: [{ type: 'code', lang: 'md', meta: node.meta, value: node.value }],
					},
				],
			}
		})
		return tree
	}
}
