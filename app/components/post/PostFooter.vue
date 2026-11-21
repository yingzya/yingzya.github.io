<script setup lang="ts">
import type ArticleProps from '~/types/article'

defineOptions({ inheritAttrs: false })
const props = defineProps<ArticleProps>()

const appConfig = useAppConfig()
const customCopyright = computed(() => props.meta?.slots?.copyright)
</script>

<template>
<div class="post-footer">
	<section v-if="references" class="reference">
		<div id="references" class="title text-creative">
			参考链接
		</div>

		<div class="content">
			<ul>
				<li v-for="{ title, link }, i in references" :key="i">
					<ProseA :href="link || ''">
						{{ title ?? link }}
					</ProseA>
				</li>
			</ul>
		</div>
	</section>

	<section class="license">
		<div class="title text-creative">
			{{ customCopyright?.props.title || '许可协议' }}
		</div>

		<div class="content">
			<ContentRenderer v-if="customCopyright" :value="customCopyright" />
			<p v-else>
				本文采用 <ProseA :href="appConfig.copyright.url">
					{{ appConfig.copyright.name }}
				</ProseA>
				许可协议，转载请注明出处。
			</p>
		</div>
	</section>
</div>
</template>

<style lang="scss" scoped>
.post-footer {
	margin: 2rem 0.5rem;
	border: 1px solid var(--c-border);
	border-radius: 1rem;
	background-color: var(--c-bg-2);
}

section {
	padding: 1rem;

	& + section {
		border-top: 1px solid var(--c-border);
	}
}

.title {
	font-weight: bold;
	color: var(--c-text);
}

.content {
	margin-top: 0.5em;
	font-size: 0.9rem;

	li {
		margin: 0.5em 0;
	}
}
</style>
