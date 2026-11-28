import type { BundledLanguage, LanguageRegistration } from 'shiki'

interface CodeLanguage {
	names: [BundledLanguage, ...BundledLanguage[]]
	load: () => Promise<{ default: LanguageRegistration[] }>
}

/**
 * Both Markdown at build time and editable commands in the browser use this list.
 * Keep grammar imports explicit so Vite only emits the languages the blog uses.
 */
export const codeLanguages: CodeLanguage[] = [
	{ names: ['shellscript', 'bash', 'sh', 'shell', 'zsh'], load: () => import('shiki/langs/shellscript.mjs') },
	{ names: ['bat', 'batch', 'cmd'], load: () => import('shiki/langs/bat.mjs') },
	{ names: ['powershell', 'ps', 'ps1'], load: () => import('shiki/langs/powershell.mjs') },
	{ names: ['cpp'], load: () => import('shiki/langs/cpp.mjs') },
	{ names: ['html'], load: () => import('shiki/langs/html.mjs') },
	{ names: ['java'], load: () => import('shiki/langs/java.mjs') },
	{ names: ['javascript', 'js'], load: () => import('shiki/langs/javascript.mjs') },
	{ names: ['json'], load: () => import('shiki/langs/json.mjs') },
	{ names: ['markdown', 'md'], load: () => import('shiki/langs/markdown.mjs') },
	{ names: ['python', 'py'], load: () => import('shiki/langs/python.mjs') },
	{ names: ['toml'], load: () => import('shiki/langs/toml.mjs') },
	{ names: ['typescript', 'ts'], load: () => import('shiki/langs/typescript.mjs') },
	{ names: ['vue'], load: () => import('shiki/langs/vue.mjs') },
	{ names: ['xml'], load: () => import('shiki/langs/xml.mjs') },
	{ names: ['yaml', 'yml'], load: () => import('shiki/langs/yaml.mjs') },
]
