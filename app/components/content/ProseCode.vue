<template>
<code class="shiki"><slot /></code>
</template>

<style lang="scss" scoped>
code {
	margin: 0.1em;
	padding: 0.1rem 0.3em;
	border: 1px solid var(--c-border);
	border-radius: 4px;
	background-color: var(--c-bg-2);
	font-size: 0.8125em;
	white-space: break-spaces;

	@supports (color: color-mix(in srgb, transparent, transparent)) {
		border-color: color-mix(in srgb, currentcolor 10%, transparent);
		background-color: color-mix(in srgb, currentcolor 5%, transparent);
	}
}
</style>
