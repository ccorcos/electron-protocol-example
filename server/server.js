const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const cors = require("access-control")

const app = express()
app.use(morgan("dev"))

// Test serving files.
app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})

app.get("/app.js", (req, res) => {
	res.sendFile(__dirname + "/app.js")
})

// Test post requests.
app.use(bodyParser.json())

app.post("/xhrping", (req, res) => {
	console.log("/xhrping data", req.body)
	res.json({ message: "pong" })
})

app.post("/fetchping", (req, res) => {
	console.log("/fetchping data", req.body)
	res.json({ message: "pong" })
})

// Test cookies.
app.use(cookieParser())

app.get("/setCookies", (req, res) => {
	res.cookie("clientCookie", "xxx")
	res.cookie("serverCookie", "yyy", { httpOnly: true })
	res.send()
})

app.post("/logCookies", (req, res) => {
	console.log(req.cookies)
	res.send()
})

app.post("/clearCookies", (req, res) => {
	console.log(req.cookies)
	res.clearCookie("clientCookie")
	res.clearCookie("serverCookie")
	res.send()
})

app.listen(8080, () => {
	console.log("Serving from localhost:8080")
})

// Test CORS requests. You can't have a origin * if you're sending credentials so it is common
// to set the origin from the client which is happening here:
// https://github.com/primus/access-control/blob/a466b729d65c32580e7e019c7f0278e50915b6d1/index.js#L125

const corsApp = express()
corsApp.use(morgan("dev"))
corsApp.use(
	cors({
		credentials: true,
		origins: "*",
	})
)

corsApp.use(bodyParser.json())

corsApp.post("/corsping", (req, res) => {
	console.log("/corsping data", req.body)
	res.json({ message: "pong" })
})

corsApp.listen(8081, () => {
	console.log("Serving cors app from localhost:8081")
})
