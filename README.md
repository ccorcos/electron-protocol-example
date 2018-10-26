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

	**This appears to be broken**

