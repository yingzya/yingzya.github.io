<script setup lang="ts">
import { NuxtTime } from '#components'
import { toZonedTime } from 'date-fns-tz'

interface StatsData {
	total: {
		posts: number
		words: number
	}
	annual: Record<string, {
		posts: number
		words: number
	}>
}

const appConfig = useAppConfig()
const runtimeConfig = useRuntimeConfig()
// 将服务器时区转换为博客指定时区
const buildTime = toZonedTime(runtimeConfig.public.buildTime, appConfig.timezone)

const { data: stats } = useFetch<StatsData>('/api/stats')

const totalWords = computed(() => formatNumber(stats.value?.total?.words) || appConfig.component.stats.wordCount)
const yearlyTip = computed(() => Object
	.entries(stats.value?.annual || {})
	.reverse()
	.map(([year, item]) => `${year}年：${item.posts}篇，${formatNumber(item.words)}字`)
	.join('\n') || '数据获取失败',
)

const blogStats = computed(() => [{
	label: '运营时长',
	value: timeElapse(appConfig.timeEstablished),
	tip: `博客于${appConfig.timeEstablished}上线`,
}, {
	label: '上次更新',
	value: () => h(NuxtTime, { datetime: runtimeConfig.public.buildTime, relative: true }),
	tip: `构建于${getLocaleDatetime(buildTime)}`,
}, {
	label: '总字数',
	value: totalWords,
	tip: yearlyTip,
}])
</script>

<template>
<ZWidget card title="博客统计">
	<ZDlGroup :items="blogStats" size="small" />
</ZWidget>
</template>
