<script setup lang="ts">
import { LazyPopoverLightbox } from '#components'

const props = withDefaults(defineProps<{
	src: string
	alt?: string
	mirror?: ImgService
	caption?: string
	filter?: string
	width?: string | number
	height?: string | number
	zoom?: boolean
}>(), {
	caption: '',
	zoom: true,
})

const slots = useSlots()
const pic = useTemplateRef('pic')
const popoverStore = usePopoverStore()

const { open, close } = popoverStore.use(() => h(LazyPopoverLightbox, {
	el: unrefElement(pic)!,
	caption: props.caption || props.alt,
}, slots.caption ? { caption: slots.caption } : undefined), { unique: true })

onBeforeUnmount(close)
</script>

<template>
<!-- <ProseImg> 被 <p> 包裹，服务端渲染时若内含块级元素会自动关闭，导致水合不匹配 -->
<figure class="image">
	<ZRawImg
		ref="pic"
		class="image"
		:style="{ cursor: zoom ? 'zoom-in' : undefined, filter }"
		:src :alt="alt || caption" :width :height :mirror
		:role="zoom ? 'button' : undefined"
		:tabindex="zoom ? 0 : undefined"
		:aria-label="zoom ? `放大图片 ${alt || caption || ''}`.trim() : undefined"
		:aria-haspopup="zoom ? 'dialog' : undefined"
		@click="zoom && open()"
		@keydown.enter.prevent="zoom && open()"
		@keydown.space.prevent="zoom && open()"
	/>
	<figcaption v-if="caption || $slots.caption">
		<slot name="caption">
			{{ caption }}
		</slot>
	</figcaption>
</figure>
</template>

<style lang="scss" scoped>
figcaption {
	margin-top: -0.5em;
	font-size: 0.8em;
	text-align: center;
	color: var(--c-text-2);
}
</style>
