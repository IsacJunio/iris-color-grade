import { ipcRenderer, contextBridge } from 'electron';

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electronAPI', {
  getHfToken: () => ipcRenderer.invoke('get-hf-token'),
});
