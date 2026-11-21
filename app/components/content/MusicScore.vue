<script setup lang="ts">
import 'abcjs/abcjs-audio.css'

const props = defineProps<{ abc: string }>()
const score = useTemplateRef<HTMLDivElement>('score')
const controls = useTemplateRef<HTMLDivElement>('controls')
const visible = useElementVisibility(score, { rootMargin: '300px' })
const ready = ref(false)
whenever(visible, () => ready.value = true, { once: true })

const rendered = ref(false)
const failed = ref(false)

onMounted(() => {
	watch([ready, () => props.abc], async ([shouldRender, abc], _, onCleanup) => {
		if (!shouldRender || !score.value || !controls.value)
			return

		rendered.value = false
		failed.value = false
		const paper = score.value
		const player = controls.value
		let disposed = false
		onCleanup(() => {
			disposed = true
			paper.replaceChildren()
			player.replaceChildren()
		})

		try {
			const { default: abcjs } = await import('abcjs')
			if (disposed)
				return

			const [tune] = abcjs.renderAbc(paper, abc, { responsive: 'resize' })
			if (!tune)
				throw new Error('No ABC tune')
			rendered.value = true

			if (abcjs.synth.supportsAudio()) {
				const controller = new abcjs.synth.SynthController()
				onCleanup(() => controller.pause())
				controller.load(player, null, {
					displayPlay: true,
					displayProgress: true,
					displayRestart: true,
					displayLoop: true,
					displayWarp: true,
				})
				await controller.setTune(tune, false)
			}
		}
		catch {
			if (!disposed)
				failed.value = true
		}
	}, { immediate: true })
})
</script>

<template>
<figure class="music-score">
	<div ref="score" class="score-paper" />
	<div ref="controls" class="score-controls" />
	<p v-if="failed" role="status">
		{{ rendered ? '暂时无法播放乐谱' : '暂时无法显示乐谱' }}
	</p>
	<pre v-if="!rendered" class="score-source scrollcheck-x"><code>{{ abc }}</code></pre>
</figure>
</template>

<style lang="scss" scoped>
.music-score {
	margin: 1em 0;
}

.score-paper {
	min-height: 1px;
	color: var(--c-text);
}

.score-source {
	overflow-x: auto;
	padding: 1em;
	border-radius: 0.5em;
	background-color: var(--c-bg-2);
}
</style>
