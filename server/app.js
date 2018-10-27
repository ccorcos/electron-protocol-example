// Need to register as privileged for window.fetch to work.
const { webFrame } = require("electron")
webFrame.registerURLSchemeAsPrivileged("myapp")

// Test XHR ping
const xhr = new XMLHttpRequest()
xhr.open("POST", "/xhrping", true)
xhr.setRequestHeader("Content-Type", "application/json")
xhr.send(JSON.stringify({ message: "xhrping" }))
xhr.onreadystatechange = function() {
	if (xhr.readyState === 4) {
		console.log("xhr response", JSON.parse(xhr.responseText))
	}
}

// Test fetch ping
fetch("/fetchping", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ message: "fetchping" }),
})
	.then(r => r.json())
	.then(r => console.log("fetch response", r))

// Test cookies
fetch("/logCookies", {
	method: "post",
}).then(() => {
	fetch("/setCookies").then(() => {
		console.log("cookies", document.cookie)
		fetch("/logCookies", {
			method: "post",
		}).then(() => {
			fetch("/clearCookies", {
				method: "post",
			}).then(() => {
				fetch("/logCookies", {
					method: "post",
				})
			})
		})
	})
})
