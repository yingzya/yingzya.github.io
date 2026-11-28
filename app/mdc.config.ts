import { defineConfig } from '@nuxtjs/mdc/config'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import {
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerNotationWordHighlight,
	transformerRenderWhitespace,
} from '@shikijs/transformers'

export default defineConfig({
	shiki: {
		transformers(code) {
			const lines = code.split('\n')
			return [
				transformerNotationWordHighlight(),
				transformerMetaHighlight(),
				transformerMetaWordHighlight(),
				transformerRenderWhitespace(),
				transformerColorizedBrackets(),
				{
					name: 'blog:data-line',
					line(node, line) {
						node.properties['data-line'] = line
						const indent = lines[line - 1]?.match(/^[\t ]+/)?.[0]
						if (indent) {
							node.children.unshift({
								type: 'element',
								tagName: 'span',
								properties: { 'class': 'indent-guide', 'data-indent': indent, 'aria-hidden': 'true' },
								children: [{ type: 'text', value: '' }],
							})
						}
					},
				},
			]
		},
	},
})
