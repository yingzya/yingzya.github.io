<template>
<NuxtLoadingIndicator />
<SkipToContent />
<ZSidebar />
<div id="content">
	<main id="main-content">
		<slot />
		<ZFooter />
	</main>
	<ZAside />
</div>
<ZPanel />
<ZPopover />
</template>

<!-- eslint-disable-next-line vue/enforce-style-attribute -->
<style lang="scss">
#z-root {
	display: flex;
	justify-content: center;
	gap: 1rem;
	min-width: 0;
}

#z-sidebar, #z-aside {
	flex-shrink: 0;
	position: sticky;
	top: 0;
	width: 280px;
	height: 100vh;
	height: 100dvh;
	scrollbar-width: thin;

	@media (max-width: $breakpoint-widescreen) {
		flex-shrink: 0.2;
	}
}

#content {
	display: flex;
	gap: 1rem;
	width: $breakpoint-widescreen;
	min-width: 0;

	> main {
		flex-grow: 1;
		min-width: 0;
	}
}
</style>
