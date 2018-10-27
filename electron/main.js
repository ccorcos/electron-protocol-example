const { app, protocol, BrowserWindow } = require("electron")
const request = require("request")

// TODO: persist jar with touch-cookie-store, perhaps using electron-store
const cookieJar = request.jar()

const customProtocol = "myapp"

protocol.registerStandardSchemes([customProtocol])

app.on("ready", async function() {
	protocol.registerStreamProtocol(
		customProtocol,
		(req, callback) => {
			const httpUrl = req.url.replace(customProtocol, "http")
			console.log(req)
			console.log("\n")
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
			const url = customProtocol + "://localhost:8080"
			mainWindow.loadURL(url)
		}
	)
})
