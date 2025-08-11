<script setup lang="ts">
import type { CSSProperties } from 'vue'

const appConfig = useAppConfig()

const contentStyle = computed<CSSProperties>(() => ({
	'--seasonal-bg': appConfig.seasonal.widgetBackground
		? `url(${appConfig.seasonal.widgetBackground})`
		: undefined,
	'--seasonal-emoji': appConfig.seasonal.emoji,
}))
</script>

<template>
<ZWidget
	card
	title="可访问性"
	content-class="seasonal"
	:style="contentStyle"
>
	<!-- TODO: 优化技术架构展示 -->
	<p>托管于 Vercel、阿里云；博客由 Nuxt Content 驱动，使用去图图床。</p>
	<p>
		秋天的风它不曾见过桃花
	</p>
</ZWidget>
</template>

<style lang="scss" scoped>
.seasonal {
	position: relative;
	overflow: hidden;
	z-index: 0;

	&::before {
		content: "";
		position: absolute;
		opacity: 0.2;
		inset: 0;
		background: center / cover;
		background-image: var(--seasonal-bg);
		z-index: -1;
	}
}

.seasonal-emoji::before, .seasonal-emoji::after {
	// 文明用语😋
	content: var(--seasonal-emoji, "\1F595");
}
</style>
