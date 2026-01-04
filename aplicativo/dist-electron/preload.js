"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose safe APIs to renderer
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getHfToken: () => electron_1.ipcRenderer.invoke('get-hf-token'),
});
