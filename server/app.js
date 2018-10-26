// Need to register as privileged for window.fetch to work.
const { webFrame } = require("electron")
webFrame.registerURLSchemeAsPrivileged("myapp")

const xhr = new XMLHttpRequest()
xhr.open("POST", "/xhrping", true)
xhr.setRequestHeader("Content-Type", "application/json")
xhr.send(JSON.stringify({ message: "xhrping" }))
xhr.onreadystatechange = function() {
	if (xhr.readyState === 4) {
		console.log("xhr response", JSON.parse(xhr.response.body))
	}
}

fetch("/fetchping", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ message: "fetchping" }),
})
	.then(r => r.json())
	.then(r => console.log("fetch response", r))
