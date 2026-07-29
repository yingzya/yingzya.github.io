/**
 * Shiki 代码高亮主题配置。
 *
 * 此文件定义 @nuxt/content 内建高亮引擎使用的主题。
 * 当前博客使用自定义 `stores/shiki.ts` 进行运行时高亮（`content.build.markdown.highlight: false`），
 * 因此本文件仅为配置参考。
 *
 * 如需切换为 Nuxt Content 内建高亮：
 *   1. 在 nuxt.config.ts 中将 `content.build.markdown.highlight` 设为 true
 *   2. 此文件即自动生效
 *   3. 可逐步移除 stores/shiki.ts 及 ProseCode/ProsePre 中的自定义逻辑
 *
 * 参考：https://content.nuxt.com/docs/advanced/highlighting
 */
import { defineConfig } from '#shiki/config'

export default defineConfig({
	themes: {
		light: () => import('shiki/themes/catppuccin-latte.mjs'),
		dark: () => import('shiki/themes/one-dark-pro.mjs'),
	},
})
