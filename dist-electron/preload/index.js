const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
  receive: (channel, listener) => {
    ipcRenderer.on(channel, (event, ...args) => listener(...args));
  },
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  }
});

//# sourceMappingURL=index.js.map