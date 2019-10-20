const global = require('./global')
const exec = require('child_process').exec

const Cardamomo = require('./lib/cardamomo/cardamomo.socket')

var s = {
  _tray: null,
  setTray: (tray) => {
    this._tray = tray
  },
  _socket: null,
  setSocket: (socket) => {
    s._socket = socket
  },
  open: () => {
    let config = global.getConfig()

    console.log('Connect to socket server ' + config.server + '/hipno')

    let cardamomo = new Cardamomo()
    let ws = cardamomo.socket(config.server + '/hipno')

    ws.onOpen((reopen) => {
      ws.send('initialize', {
        'token': config.token,
        'device': {
          id: config.id,
          name: config.name
        }
      })
    })

    ws.on('initialized', (response) => {
      if (response.success === false && response.error === 'U100') {
        // Error
      } else {
        this._tray.setImage(global.getAppPath() + '/assets/img/snorlax-16.png')
      }
    })

    ws.on('control:sleep', () => {
      console.log('Going to sleep...')

      if (process.platform === 'darwin') {
        exec('echo ' + config.admin + ' | sudo -S shutdown -s now', (error, stdout, stderr) => {
          if (error) {
            // Alert sleep error
            console.log(error)
            console.log(stderr)
          }
        })
      } else if (process.platform === 'win32') {
        exec('shutdown /h', (error, stdout, stderr) => {
          if (error) {
            // Alert sleep error
          }
        })
      }
    })

    ws.on('control:shutdown', () => {
      console.log('Going to shutdown...')

      if (process.platform === 'darwin') {
        exec('shutdown -h now', (error, stdout, stderr) => {
          if (error) {
            // Alert shutdown error
          }
        })
      } else if (process.platform === 'win32') {
        exec('shutdown', (error, stdout, stderr) => {
          if (error) {
            // Alert sleep error
          }
        })
      }
    })

    ws.onClose((error, destroyed) => {
      console.log('On close socket! Error: ' + error + ' Destroyed: ' + destroyed)
      if (error) {
        // Alert socket connection error
      }
      this._tray.setImage(global.getAppPath() + '/assets/img/snorlax-gray-16.png')
    })

    s.setSocket(ws)
  },
  reload: () => {
    s._socket.destroy()
    setTimeout(() => {
      s.open()
    }, 5000)
  }
}

module.exports = s
