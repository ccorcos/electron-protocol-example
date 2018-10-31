# Electron.protocol.registerStreamProtocol Issues

```sh
npm install
npm run server
npm start # In a separate terminal
```

## Caveats / Issues

- I'm using `protocol.registerStreamProtocol` but XHR, `<script>`, and `<img>` don't work.

	Need to use `protocol.registerStandardSchemes` before `protocol.registerStreamProtocol`

- `XMLHttpRequest` works but `window.fetch` doesn't. It says `URL scheme "myapp" is not supported"`.

	Need to use `webFrame.registerURLSchemeAsPrivileged` inside the renderer process.

- `XMLHttpRequest` body data never makes it to the protocol handler.

	**This appears to be broken**

- Cookies dont appear to work.

	Use the `request.jar()` in the main process. There's still some isolation here from the renderer process.

- CORS requests don't work, but the message makes no sense.

	> Failed to load http://localhost:8081/corsping: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'myapp://localhost:8080' that is not equal to the supplied origin. Origin 'myapp://localhost:8080' is therefore not allowed access. Have the server send the header with a valid value, or, if an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.

	Well it just so happens that if there is a port, then Chromium is not going to compare these origins properly. The solution is to load
	a url without the port and inject that after the fact.

	- https://github.com/chromium/chromium/blob/88c0927e5428d8a310a8f025d86cee6e18b380be/url/scheme_host_port.cc#L94

	- https://github.com/electron/electron/blob/a8f2646ba682d65f94ea628ac11b1a5521bcedcd/atom/browser/api/atom_api_protocol.cc#L53