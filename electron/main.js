const { app, protocol, BrowserWindow } = require("electron")
const request = require("request")
const fs = require("fs")
const path = require("path")
const url = require("url")
const mime = require("mime-types")

const proxyAllRequests = false

// TODO: persist jar with touch-cookie-store, perhaps using electron-store
const cookieJar = request.jar()

const customProtocol = "myapp"

protocol.registerStandardSchemes([customProtocol])

const { files } = require("./assets/assets.json")

app.on("ready", async function() {
	protocol.registerStreamProtocol(
		customProtocol,
		(req, callback) => {
			const httpUrl = req.url.replace(customProtocol, "http")

			const parsed = url.parse(httpUrl)

			const cached = files.indexOf(parsed.pathname.slice(1)) !== -1
			const api = parsed.pathname.startsWith("/api")
			const ext = path.parse(parsed.pathname).ext

			if (cached && !proxyAllRequests) {
				console.log("CACHE:", httpUrl)
				// Serve static assets from cache
				const fileStream = fs.createReadStream(
					path.resolve(path.join(__dirname, "assets", parsed.pathname))
				)
				callback({
					statusCode: 200,
					headers: {
						"Content-Type": mime.lookup(parsed.pathname.slice(1)),
					},
					data: fileStream,
				})
			} else if (api || ext || proxyAllRequests) {
				console.log("PROXY:", httpUrl)
				// Proxy api requests.
				const stream = request({
					url: httpUrl,
					headers: req.headers,
					method: req.method,
					jar: cookieJar,
					body:
						req.uploadData &&
						req.uploadData[0] &&
						req.uploadData[0].bytes.toString("utf8"),
				})

				stream.on("response", resp => {
					console.log("PROXY RESPONSE:", httpUrl, resp.statusCode, resp.headers)
					console.log("\n")
					callback({
						statusCode: resp.statusCode,
						headers: resp.headers,
						data: resp,
					})
				})
			} else {
				console.log("HTML:", httpUrl)
				// Serve the html file
				const fileStream = fs.createReadStream(
					path.resolve(path.join(__dirname, "assets/index.html"))
				)
				callback({
					statusCode: 200,
					headers: {
						"content-type": "text/html",
					},
					data: fileStream,
				})
			}
		},
		error => {
			if (error) {
				console.error(error)
				return
			}

			const mainWindow = new BrowserWindow({
				webPreferences: {
					nodeIntegration: true,
				},
			})
			const url = customProtocol + "://localhost:8080"
			mainWindow.loadURL(url)
		}
	)
})
