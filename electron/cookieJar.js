const request = require("request")
const { Store, fromJSON } = require("tough-cookie")
const ElectronStore = require("electron-store")

const electronStore = new ElectronStore()

class CookieStore extends Store {
	constructor() {
		super()
		this.synchronous = true
	}
	findCookie(domain, path, key, cb) {
		const cookieObj = electronStore.get("cookies") || {}
		const domainObj = cookieObj[domain] || {}
		const pathObj = domainObj[path] || {}
		const cookie = pathObj[key]
		cb(null, fromJSON(cookie))
	}
	findCookies(domain, path, cb) {
		const cookieObj = electronStore.get("cookies") || {}
		const domainObj = cookieObj[domain] || {}
		console.log("findCookiesPath", path)
		if (!path || path === "/") {
			const cookies = []
			for (const path in domainObj) {
				const pathObj = domainObj[path]
				for (const key in pathObj) {
					const cookie = pathObj[key]
					cookies.push(fromJSON(cookie))
				}
			}
			console.log("findCookies1", cookies)
			cb(null, cookies)
		} else {
			const pathObj = domainObj[path] || {}
			const cookies = Array.from(Object.values(pathObj)).map(fromJSON)
			console.log("findCookies2", cookies)

			cb(null, cookies)
		}
	}
	putCookie(cookie, cb) {
		const { domain, path, key } = cookie
		const cookieObj = electronStore.get("cookies") || {}
		const domainObj = cookieObj[domain] || {}
		const pathObj = domainObj[path] || {}
		pathObj[key] = cookie.toJSON()
		domainObj[path] = pathObj
		cookieObj[domain] = domainObj
		electronStore.set("cookies", cookieObj)
		cb(null)
	}
	updateCookie(oldCookie, newCookie, cb) {
		this.putCookie(newCookie, cb)
	}
	removeCookie(domain, path, key, cb) {
		const cookieObj = electronStore.get("cookies") || {}
		const domainObj = cookieObj[domain] || {}
		const pathObj = domainObj[path] || {}
		delete pathObj[key]
		domainObj[path] = pathObj
		cookieObj[domain] = domainObj
		electronStore.set("cookies", cookieObj)
		cb(null)
	}
	removeCookies(domain, path, cb) {
		const cookieObj = electronStore.get("cookies") || {}
		const domainObj = cookieObj[domain] || {}
		delete domainObj[path]
		cookieObj[domain] = domainObj
		electronStore.set("cookies", cookieObj)
		cb(null)
	}
	getAllCookies(cb) {
		const cookieObj = electronStore.get("cookies") || {}
		const cookies = []
		for (const domain in cookieObj) {
			const domainObj = cookieObj[domain]
			for (const path in domainObj) {
				const pathObj = domainObj[path]
				for (const key in pathObj) {
					const cookie = pathObj[key]
					cookies.push(fromJSON(cookie))
				}
			}
		}
		cb(null, cookies)
	}
}

const cookieJar = request.jar(new CookieStore())

module.exports = cookieJar
