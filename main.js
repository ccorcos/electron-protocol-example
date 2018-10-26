const electron = require("electron")
const app = electron.app
const protocol = electron.protocol
const BrowserWindow = electron.BrowserWindow
const { PassThrough } = require("stream")

const customProtocol = "myapp"

function createStream(text) {
	const rv = new PassThrough()
	rv.push(text)
	rv.push(null)
	return rv
}

function createMainWindow() {
	let mainWindow = new BrowserWindow()
	let url = customProtocol + "://www.example.com"
	mainWindow.loadURL(url)
	return mainWindow
}

protocol.registerStandardSchemes([customProtocol])

app.on("ready", async function() {
	protocol.registerStreamProtocol(
		customProtocol,
		(request, callback) => {
			console.log(request)

			if (request.method.toLowerCase() === "post") {
				setTimeout(() => {
					callback({
						statusCode: 200,
						data: createStream(`{}`),
					})
				}, 0)
			} else {
				setTimeout(() => {
					callback({
						statusCode: 200,
						headers: {
							"content-type": "text/html",
						},
						data: createStream(`
            <html>
            <head>
            </head>
            <body>
                HTML Loaded
								<script>
									// Need to registry as privileged to
									const webFrame = require("electron").webFrame
									webFrame.registerURLSchemeAsPrivileged("${customProtocol}")

									const xhr = new XMLHttpRequest()
									xhr.open("POST", "/xhrping", true)
									xhr.send("I am xhr body data")

									fetch("/fetchping", {method: "POST", body: "I am fetch body data"})
								</script>
            </body>
            <html>
            `),
					})
				}, 0)
			}
		},
		error => {
			if (error) {
				console.error("failed to register protocol handler for HTTP")
				console.error(error)
				return
			}

			console.log("we're registered now.")

			let mainWindow = createMainWindow()
		}
	)
})
