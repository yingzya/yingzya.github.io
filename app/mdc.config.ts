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
