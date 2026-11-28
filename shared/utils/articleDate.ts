import { toDate } from 'date-fns-tz'
import blogConfig from '../../blog.config'

/** 没有偏移量的文章日期采用站点时区，带偏移量的日期保留原本的时刻。 */
export function parseArticleDate(value: unknown): Date | undefined {
	if (value instanceof Date)
		return Number.isNaN(value.getTime()) ? undefined : value
	if (typeof value !== 'string' || !value.trim())
		return

	// 旧的 pnpm new 会在英语系统上把时间写成“4:33:42 PM”。
	const text = value.trim().replace(/\s(1[0-2]|0?[1-9])(:\d{2}:\d{2})\s*([ap])m$/i, (_, hour, rest, period) => {
		const hours = Number(hour) % 12 + (period.toLowerCase() === 'p' ? 12 : 0)
		return ` ${String(hours).padStart(2, '0')}${rest}`
	})
	const date = toDate(text, { timeZone: blogConfig.timezone })
	return Number.isNaN(date.getTime()) ? undefined : date
}
