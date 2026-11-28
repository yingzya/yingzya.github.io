import { createPlainShiki } from 'plain-shiki'
import { createHighlighterCore } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { codeLanguages } from '~~/shared/codeLanguages'

function createCommandHighlighter() {
	return createHighlighterCore({
		engine: createJavaScriptRegexEngine(),
		themes: [
			import('shiki/themes/catppuccin-latte.mjs'),
			import('shiki/themes/one-dark-pro.mjs'),
		],
	})
}

let highlighter: ReturnType<typeof createCommandHighlighter> | undefined

export async function prepareCommandHighlight(language: string) {
	const name = language.toLowerCase()
	const grammar = codeLanguages.find(entry => (entry.names as readonly string[]).includes(name))
	if (!grammar)
		return

	const lang = grammar.names[0]
	highlighter ??= createCommandHighlighter().catch((error) => {
		highlighter = undefined
		throw error
	})
	const shiki = await highlighter
	if (!shiki.getLoadedLanguages().includes(lang))
		await shiki.loadLanguage(grammar.load)

	const plain = createPlainShiki(shiki)
	return (el: HTMLElement) => plain.mount(el, {
		lang,
		themes: { light: 'catppuccin-latte', dark: 'one-dark-pro' },
		defaultSelector: '.copy [contenteditable]',
		selector: theme => `.${theme} .copy [contenteditable]`,
		// Update on native input and explicit resets. Disable delayed work on discarded nodes.
		watch: false,
		delay: 0,
	})
}
