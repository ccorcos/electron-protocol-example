const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const app = express()
app.use(morgan("dev"))

// Serve static files.
app.use(express.static(__dirname + "/assets"))

// Test post requests.
app.use(bodyParser.json())

app.post("/api/xhrping", (req, res) => {
	console.log("/xhrping data", req.body)
	res.json({ message: "pong" })
})

app.post("/api/fetchping", (req, res) => {
	console.log("/fetchping data", req.body)
	res.json({ message: "pong" })
})

// Test cookies.
app.use(cookieParser())

app.get("/api/setCookies", (req, res) => {
	res.cookie("clientCookie", "xxx")
	res.cookie("serverCookie", "yyy", { httpOnly: true })
	res.send()
})

app.post("/api/logCookies", (req, res) => {
	console.log(req.cookies)
	res.send()
})

app.post("/api/clearCookies", (req, res) => {
	console.log(req.cookies)
	res.clearCookie("clientCookie")
	res.clearCookie("serverCookie")
	res.send()
})

// Serve html to everyone else.
app.get("*", (req, res) => {
	res.sendFile(__dirname + "/assets/index.html")
})

app.listen(8080, () => {
	console.log("Serving from localhost:8080")
})
