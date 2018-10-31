const { app, protocol, BrowserWindow } = require("electron")
const request = require("request")
const url = require("url")

// TODO: persist jar with touch-cookie-store, perhaps using electron-store
const cookieJar = request.jar()

const customProtocol = "myapp"

protocol.registerStandardSchemes([customProtocol])

app.on("ready", async function() {
	protocol.registerStreamProtocol(
		customProtocol,
		(req, callback) => {
			// req.url: myapp://localhost/abc
			// httpUrl: http://localhost:8080/abc
			const parsed = url.parse(req.url)
			parsed.protocol = "http:"
			delete parsed.host
			parsed.port = 8080
			const httpUrl = url.format(parsed)

			console.log(req)
			console.log("\n")

			// TODO: might be better to push buffers into the request stream?
			let body = undefined
			if (req.uploadData) {
				body = req.uploadData
					.map(({ bytes }) => bytes.toString("utf8"))
					.join(",")
			}

			const stream = request({
				url: httpUrl,
				headers: req.headers,
				method: req.method,
				jar: cookieJar,
				body: body,
			})

			stream.on("response", resp => {
				console.log(httpUrl, resp.statusCode, resp.headers)
				console.log("\n")
				callback({
					statusCode: resp.statusCode,
					headers: resp.headers,
					data: resp,
				})
			})
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

			// Leave off the port so CORS works.
			const url = customProtocol + "://localhost"
			mainWindow.loadURL(url)
		}
	)
})
