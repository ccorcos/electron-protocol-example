// TODO: use electron-cookie to handle local cookies for amplitude, etc.

// Need to register as privileged for window.fetch to work.
const { webFrame } = require("electron")
const { customProtocol } = require("../../config")
webFrame.registerURLSchemeAsPrivileged(customProtocol)

// Test XHR ping
const xhr = new XMLHttpRequest()
xhr.open("POST", "/api/xhrping", true)
xhr.setRequestHeader("Content-Type", "application/json")
xhr.send(JSON.stringify({ message: "xhrping" }))
xhr.onreadystatechange = function() {
	if (xhr.readyState === 4) {
		console.log("xhr response", JSON.parse(xhr.responseText))
	}
}

// Test fetch ping
fetch("/api/fetchping", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ message: "fetchping" }),
})
	.then(r => r.json())
	.then(r => console.log("fetch response", r))

// Test cookies
fetch("/api/logCookies", {
	method: "post",
}).then(() => {
	fetch("/api/setCookies").then(() => {
		console.log("cookies", document.cookie)
		fetch("/api/logCookies", {
			method: "post",
		}).then(() => {
			fetch("/api/clearCookies", {
				method: "post",
			}).then(() => {
				fetch("/api/logCookies", {
					method: "post",
				})
			})
		})
	})
})