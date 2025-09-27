<script setup lang="ts">
const appConfig = useAppConfig()
const timeEstablished = appConfig.timeEstablished

const blogLog = [
	{ label: '2025-07-31', value: '博客框架迁移为 Nuxt + Nuxt Content'},
	{ label: timeEstablished, value: '博客上线，采用Butterfly主题'},
]
</script>

<template>
<ZWidget card title="更新日志">
	<ZDlGroup size="large" :items="blogLog" />
</ZWidget>
</template>
