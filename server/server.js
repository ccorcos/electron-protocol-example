const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

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

app.listen(8080, () => {
	console.log("Serving from localhost:8080")
})
