interface Twikoo {
	init: (options: { envId: string, el: HTMLElement, path: string }) => Promise<void>
}

const scriptUrl = 'https://lib.baomitu.com/twikoo/1.6.44/twikoo.min.js'
let pending: Promise<Twikoo> | undefined

export function loadTwikoo() {
	const client = window as Window & { twikoo?: Twikoo }
	// 脚本加载前，浏览器也会把 id="twikoo" 的元素挂到 window.twikoo。
	if (typeof client.twikoo?.init === 'function')
		return Promise.resolve(client.twikoo)

	pending ??= new Promise<Twikoo>((resolve, reject) => {
		const script = document.createElement('script')
		script.src = scriptUrl
		script.async = true
		function fail() {
			script.remove()
			pending = undefined
			reject(new Error('评论脚本未能加载'))
		}
		script.onload = () => typeof client.twikoo?.init === 'function' ? resolve(client.twikoo) : fail()
		script.onerror = fail
		document.head.append(script)
	})
	return pending
}
