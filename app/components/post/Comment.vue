<script setup lang="ts">
const appConfig = useAppConfig()
const commentSection = useTemplateRef('comment-section')
const mount = useTemplateRef('comment-mount')
const failed = ref(false)
const visible = useElementVisibility(commentSection, { rootMargin: '200px' })
whenever(visible, loadComments, { once: true })

async function loadComments() {
	const target = mount.value
	if (!target)
		return
	failed.value = false
	const path = window.location.pathname
	try {
		const twikoo = await loadTwikoo()
		// 页面可能已切换；把 Vue 2 评论组件挂到原节点，避免误用下一页的 #twikoo。
		if (target === mount.value && target.isConnected)
			await twikoo.init({ el: target, envId: appConfig.twikoo.envId, path })
	}
	catch {
		failed.value = true
	}
}

const dialog = useTemplateRef('external-link')
const original = ref('')
const address = ref('')
const destination = computed(() => {
	try {
		const url = new URL(address.value)
		if (url.protocol === 'https:' || url.protocol === 'http:')
			return url
	}
	catch {}
	return undefined
})

function inspectLink(event: MouseEvent) {
	if (!(event.target instanceof Element) || (event.type === 'auxclick' && event.button !== 1))
		return
	const avatar = event.target.closest('.tk-avatar.tk-clickable')
	const anchor = avatar
		? avatar.closest('.tk-comment')?.querySelector<HTMLAnchorElement>('a.tk-nick-link')
		: event.target.closest<HTMLAnchorElement>('a[href]')
	// Twikoo 的头像通过自己的点击处理器打开作者网站。
	if (!anchor) {
		if (avatar)
			event.stopPropagation()
		return
	}
	if (anchor.origin === window.location.origin)
		return
	event.preventDefault()
	event.stopPropagation()
	original.value = anchor.href
	address.value = anchor.href
	dialog.value?.showModal()
}

function visitLink() {
	if (!destination.value)
		return
	window.open(destination.value.href, '_blank', 'noopener,noreferrer')
	dialog.value?.close()
}
</script>

<template>
<section ref="comment-section" class="z-comment">
	<h3 class="text-creative">
		评论区
	</h3>
	<div @click.capture="inspectLink" @auxclick.capture="inspectLink">
		<div id="twikoo" ref="comment-mount">
			<button v-if="failed" type="button" @click="loadComments">
				评论加载失败，点击重试
			</button>
			<p v-else>
				评论加载中...
			</p>
		</div>
	</div>
	<dialog ref="external-link" class="link-confirm" aria-label="访问评论中的外部链接">
		<form @submit.prevent="visitLink">
			<label>访问评论中的外部链接
				<input v-model="address" type="url" required spellcheck="false">
			</label>
			<p v-if="address && !destination">
				请输入完整的 HTTP 或 HTTPS 网址。
			</p>
			<div class="link-actions">
				<button v-if="address !== original" type="button" @click="address = original">
					还原地址
				</button>
				<ZButton type="button" text="取消" @click="dialog?.close()" />
				<ZButton type="submit" text="访问" primary :disabled="!destination" />
			</div>
		</form>
	</dialog>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
	margin: 3rem 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

.link-confirm {
	width: min(28rem, 90vw);
	margin: auto;
	padding: 1rem;
	border: 1px solid var(--c-border);
	border-radius: 0.6rem;
	background-color: var(--c-bg);
	color: var(--c-text);

	&::backdrop {
		background-color: #0004;
	}

	input {
		display: block;
		width: 100%;
		margin: 0.5em 0 1em;
		padding: 0.4em;
		border: 1px solid var(--c-border);
		border-radius: 0.3em;
	}
}

.link-actions {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 0.5em;
}

:deep(#twikoo) {
	margin: 2em 0;

	.tk-admin-container {
		position: fixed;
		z-index: 1;
	}

	.tk-input {
		font-family: var(--font-monospace);
	}

	.tk-time {
		color: var(--c-text-3);
	}

	.tk-main {
		margin-top: -0.1rem;
	}

	.tk-content {
		margin-top: 0.1rem;
	}

	.tk-comments-title, .tk-nick > strong {
		font-family: var(--font-creative);
	}

	.tk-owo-emotion {
		width: auto;
		height: 1.4em;
		vertical-align: text-bottom;
	}

	.tk-extras, .tk-footer {
		font-size: 0.7rem;
		color: var(--c-text-3);
	}

	.tk-replies:not(.tk-replies-expand) {
		mask-image: linear-gradient(#FFF 50%, transparent);
	}

	.tk-expand {
		border-radius: 0.5rem;
		transition: background-color 0.1s;
	}
}

:deep(:where(.tk-preview-container,.tk-content)) {
	pre {
		border-radius: 0.5rem;
		font-size: 0.8125rem;
	}

	p {
		margin: 0.2em 0;
	}

	img {
		border-radius: 0.5em;
	}

	menu, ol, ul {
		margin: 0.5em 0;
		padding-inline-start: 1.5em;
		font-size: 0.9rem;
		list-style: revert;

		> li {
			margin: 0.2em 0;

			&::marker {
				color: var(--c-primary);
			}
		}
	}

	blockquote {
		margin: 0.5em 0;
		padding: 0.2em 0.5em;
		border-inline-start: 4px solid var(--c-border);
		border-radius: 4px;
		background-color: var(--c-bg-2);
		font-size: 0.9rem;
	}
}
</style>
