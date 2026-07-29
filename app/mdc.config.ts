import {
	transformerNotationWordHighlight,
	transformerMetaHighlight,
	transformerMetaWordHighlight,
	transformerRenderWhitespace,
} from '@shikijs/transformers'
import { transformerColorizedBrackets } from '@shikijs/colorized-brackets'
import { defineConfig } from '@nuxtjs/mdc/config'

export default defineConfig({
	shiki: {
		transformers: [
			transformerNotationWordHighlight(),
			transformerMetaHighlight(),
			transformerMetaWordHighlight(),
			transformerRenderWhitespace(),
			transformerColorizedBrackets(),
			{
				name: 'blog:data-line',
				line(node, line) {
					node.properties['data-line'] = line
				},
			},
		],
	},
})
