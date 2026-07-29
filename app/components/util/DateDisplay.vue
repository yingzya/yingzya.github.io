<script setup lang="ts">
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale/zh-CN'

const props = defineProps<{
	date: string
	formatStr?: string
}>()

const formattedDate = computed(() => {
	if (!props.date) return ''
	return format(new Date(props.date), props.formatStr || 'yyyy-MM-dd', { locale: zhCN })
})
</script>

<template>
<time :datetime="date" :title="formattedDate">
	<slot>{{ formattedDate }}</slot>
</time>
</template>
