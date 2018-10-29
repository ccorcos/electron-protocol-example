const { app, protocol, BrowserWindow } = require("electron")
const request = require("request")
const fs = require("fs-extra")
const path = require("path")
const url = require("url")
const mime = require("mime-types")

const proxyAllRequests = false

// TODO: persist jar with touch-cookie-store, perhaps using electron-store
const cookieJar = request.jar()

protocol.registerStandardSchemes(["myapp"])

let { version, files } = require("./assets/assets.json")

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	})
	const url = "myapp" + "://" + "localhost:8080"
	mainWindow.loadURL(url)
}

app.on("ready", async function() {
	protocol.registerStreamProtocol(
		"myapp",
		(req, callback) => {
			const httpUrl = req.url.replace("myapp", "http")

			const parsed = url.parse(httpUrl)

			const cached = files.indexOf(parsed.pathname) !== -1
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
						"Content-Type": mime.lookup(parsed.pathname),
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

			createWindow()
		}
	)
})

setInterval(() => {
	request.get(
		{
			url: "http://" + "localhost:8080" + "/assets.json",
			json: true,
		},
		(err, res, data) => {
			if (err) {
				console.log("UPDATE ERROR:", err)
			} else if (res.statusCode !== 200) {
				console.log("UPDATE ERROR:", res.statusCode)
			} else {
				if (data.version === version) {
					console.log("NO UPDATE:", version)
				} else {
					console.log("UPDATING:", data.version)
					fs.mkdirp(__dirname + "/staging")
						.then(() => {
							return Promise.all(
								[...data.files, "assets.json"].map(file => {
									return new Promise((resolve, reject) => {
										const req = request(
											"http://" + "localhost:8080" + "/" + file
										)
										const write = fs.createWriteStream(
											__dirname + "/staging/" + file
										)
										req.pipe(write)
										req.on("end", resolve)
									})
								})
							)
						})
						.then(() => {
							mainWindow.close()
							return fs.move(__dirname + "/staging", __dirname + "assets", {
								overwrite: true,
							})
						})
						.then(() => {
							createWindow()
						})
				}
			}
		}
	)
}, 2000)
