import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

// Set paths for production
const isDev = !app.isPackaged;

process.env['DIST'] = path.join(__dirname, '../dist');
process.env['VITE_PUBLIC'] = isDev ? path.join(__dirname, '../public') : (process.env['DIST'] || '');

let win: BrowserWindow | null;

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
  } else {
    win.loadFile(path.join(process.env['DIST'] || '', 'index.html'));
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('get-hf-token', () => {
  return process.env.HF_TOKEN || null;
});

app.whenReady().then(createWindow);
