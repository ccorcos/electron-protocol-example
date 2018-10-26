const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")

const app = express()
app.use(morgan("dev"))

app.use(bodyParser.json())

app.get("/", (req, res) => {
	res.sendFile(__dirname + "/index.html")
})

app.get("/app.js", (req, res) => {
	res.sendFile(__dirname + "/app.js")
})

app.post("/ping", (req, res) => {
	console.log("/ping data", req.body)
	res.json({ message: "pong" })
})

app.post("/xhrping", (req, res) => {
	console.log("/xhrping data", req.body)
	res.json({ message: "pong" })
})

app.post("/fetchping", (req, res) => {
	console.log("/fetchping data", req.body)
	res.json({ message: "pong" })
})

app.listen(8080, () => {
	console.log("Serving from localhost:8080")
})
