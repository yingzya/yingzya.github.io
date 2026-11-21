// @keep-sorted
const promptLanguageMap: Record<string, string> = {
	'#': 'sh',
	'$': 'sh',
	'CMD': 'bat',
	'PS': 'powershell',
}

export function formatNumber(num?: number) {
	if (typeof num !== 'number')
		return ''
	const intervals = [
		{ label: '万亿', threshold: 1e12 },
		{ label: '亿', threshold: 1e8 },
		{ label: '万', threshold: 1e4 },
	]
	for (const interval of intervals) {
		if (num >= interval.threshold)
			return `${(num / interval.threshold).toFixed(2)}${interval.label}`
	}
	return num.toString()
}

export function getPromptLanguage(prompt: string | boolean) {
	if (typeof prompt === 'boolean')
		return 'text'
	for (const promptPrefix in promptLanguageMap) {
		if (prompt.startsWith(promptPrefix))
			return promptLanguageMap[promptPrefix] ?? 'text'
	}
	return 'text'
}

export function joinWith(strings: (string | undefined)[], separator = '\n') {
	return strings.filter(Boolean).join(separator)
}

export function escapeHtml(text: string) {
	const map: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		'\'': '&#039;',
	}
	return text.replace(/[&<>"']/g, match => map[match] || match)
}

export function highlightHtml(text: string, words?: string | string[], className = 'highlight') {
	const terms = (typeof words === 'string' ? [words] : words ?? []).filter(term => term.trim())
	if (!terms.length)
		return escapeHtml(text).replace(/\n+/g, '<br>')

	const pattern = terms
		.sort((a, b) => b.length - a.length)
		.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('|')
	const parts = text.split(new RegExp(`(${pattern})`, 'gi'))
	const escapedClass = escapeHtml(className)

	return parts.map((part, index) => index % 2 === 1
		? `<span class="${escapedClass}">${escapeHtml(part)}</span>`
		: escapeHtml(part),
	).join('').replace(/\n+/g, '<br>')
}

export function removeHtmlTags(str?: string) {
	if (typeof str !== 'string')
		return ''
	return str.replace(/<[^>]+(>|$)/g, '')
}
