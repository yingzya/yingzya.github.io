<script setup lang="ts">
const appConfig = useAppConfig()
const timeEstablished = appConfig.timeEstablished

const blogLog = [
	{ date: '2025-08-11', content: 'Nuxt Content 博客上线' },
]
</script>

<template>
<ZWidget card title="更新日志">
	<!-- TODO: 优化时间线样式 -->
	<ul>
		<li v-for="(item, index) in blogLog" :key="index">
			<small>{{ item.date }}</small><br>
			{{ item.content }}
		</li>
	</ul>
</ZWidget>
</template>
