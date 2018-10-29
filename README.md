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

	**This appears to be broken with no work-around**

- Cookies dont appear to work.

	**This appears to be broken with a work-around.** Use the `request.jar()` in the main process. There's still some isolation here from the renderer process, but its probably adequate.
