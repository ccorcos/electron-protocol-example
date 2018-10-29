const { app, protocol, BrowserWindow } = require("electron")
const request = require("request")
const fs = require("fs-extra")
const path = require("path")
const url = require("url")
const mime = require("mime-types")

// Configs
const customProtocol = "myapp"
const serverHost = "localhost:8080"
const proxyAllRequests = false

// TODO: persist jar with touch-cookie-store, perhaps using electron-store
const cookieJar = request.jar()

protocol.registerStandardSchemes([customProtocol])

let version = "0.0.0"
let files = []

function loadAssetsJSON() {
	return fs.readFile(__dirname + "/assets/assets.json").then(contents => {
		const assets = JSON.parse(contents)
		version = assets.version
		files = assets.files
	})
}

let mainWindow

function createWindow() {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true,
		},
	})
	const url = customProtocol + "://" + serverHost
	mainWindow.loadURL(url)
}

app.on("ready", function() {
	loadAssetsJSON().then(() => {
		protocol.registerStreamProtocol(
			customProtocol,
			(req, callback) => {
				const httpUrl = req.url.replace(customProtocol, "http")

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
						console.log(
							"PROXY RESPONSE:",
							httpUrl,
							resp.statusCode,
							resp.headers
						)
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
})

setInterval(() => {
	request.get(
		{
			url: "http://" + serverHost + "/assets.json",
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
								[...data.files, "/assets.json"].map(file => {
									return new Promise((resolve, reject) => {
										console.log("DOWNLOADING:", file)
										const dest = __dirname + "/staging" + file
										fs.mkdirp(path.parse(dest).dir)
											.then(() => {
												const req = request("http://" + serverHost + file)
												const write = fs.createWriteStream(
													__dirname + "/staging" + file
												)
												req.pipe(write)
												req.on("error", reject)
												req.on("end", resolve)
												write.on("error", reject)
											})
											.catch(reject)
									})
								})
							)
						})
						.then(() => {
							console.log("RELOADING")
							return fs.move(__dirname + "/staging", __dirname + "/assets", {
								overwrite: true,
							})
						})
						.then(() => {
							return loadAssetsJSON()
						})
						.then(() => {
							mainWindow.reload()
						})
				}
			}
		}
	)
}, 2000)
