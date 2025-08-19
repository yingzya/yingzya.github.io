<script setup lang="ts">
const appConfig = useAppConfig()
const timeEstablished = appConfig.timeEstablished

const blogLog = [
	{ date: '2025-07-31', content: '博客框架迁移为 Nuxt + Nuxt Content'},
	{ date: '2025-03-19', content: '博客上线，采用Butterfly主题'}
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
