<template>
<Tab :tabs="['预览', '源码']">
	<template #tab1>
		<slot />
	</template>
	<template #tab2>
		<slot name="source" />
	</template>
</Tab>
</template>
