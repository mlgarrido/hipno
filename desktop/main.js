// Modules to control application life and create native browser window
const electron = require('electron')
const { app, BrowserWindow, Menu, Tray, shell } = electron
const global = require('./global')

const path = require('path')

let socket = require('./socket')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, tray

function createWindow () {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize

  /*// Create the browser window.
  mainWindow = new BrowserWindow({
    width: 24,
    height: 24,
    x: width - 30,
    y: height - 10,
    transparent: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.setIgnoreMouseEvents(true)

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })*/

  // Init app
  global.init()

  // Load tray
  tray = new Tray(global.getAppPath() + '/assets/img/snorlax-gray-16.png')
  tray.setToolTip('Hipno')
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open data folder',
      click: async () => {
        console.log('Opening data folder ' + global.getUserDataPath())
        shell.openItem(global.getUserDataPath())
      }
    },
    {
      label: 'Reload',
      click: async () => {
        global.init()
        socket.reload()
      }
    },
    {
      type: 'separator'
    },
    {
      role: 'quit'
    }
  ])
  tray.setContextMenu(contextMenu)

  app.dock.hide()

  // Open socket connection
  socket.setTray(tray)
  socket.open()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
