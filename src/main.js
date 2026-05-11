import { app, BrowserWindow, Menu } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';

if (started) {
  app.quit();
}

Menu.setApplicationMenu(null);

const isDev = !!MAIN_WINDOW_VITE_DEV_SERVER_URL;

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1050,
    minHeight: 750,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      devTools: isDev,
    },
  });

  if (isDev) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (!isDev && (input.key === 'F12' || (input.control && input.shift && (input.key === 'I' || input.key === 'J' || input.key === 'C')))) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on('context-menu', (event) => {
    if (!isDev) {
      event.preventDefault();
    }
  });
};

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
