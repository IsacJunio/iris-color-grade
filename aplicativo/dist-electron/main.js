"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
// Set paths for production
const isDev = !electron_1.app.isPackaged;
process.env['DIST'] = path_1.default.join(__dirname, '../dist');
process.env['VITE_PUBLIC'] = isDev ? path_1.default.join(__dirname, '../public') : (process.env['DIST'] || '');
let win;
function createWindow() {
    win = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
        title: "Iris",
        backgroundColor: "#0a0a0a",
        autoHideMenuBar: true,
    });
    if (isDev) {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(process.env['DIST'] || '', 'index.html'));
    }
}
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', () => {
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
// IPC Handlers
electron_1.ipcMain.handle('get-hf-token', () => {
    return process.env.HF_TOKEN || null;
});
electron_1.app.whenReady().then(createWindow);
