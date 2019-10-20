var path = require('path')
var fs = require('fs')

const Cryptr = require('cryptr')
const cryptr = new Cryptr('Hipno_Encription_Key')

const {app} = require('electron')

var global = {
  getUserDataPath () {
    return app.getPath('userData')
  },
  getAppDataPath () {
    return app.getPath('appData')
  },
  getAppPath () {
    return app.getAppPath()
  },
  init () {
    let configFile = path.join(global.getUserDataPath(), 'config.json')
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(configFile, JSON.stringify(this._defaultConfig), { mode: 0o755 })
    }

    let data = fs.readFileSync(configFile)
    try {
      let changes = false

      config = JSON.parse(data.toString())

      if (config.admin.length > 0 && config.admin.indexOf('enc:') === -1) {
        config.admin = 'enc:' + cryptr.encrypt(config.admin)
        changes = true
      }

      if (config.server.length > 0 && config.server.indexOf('http:') === -1) {
        config.server = 'http://' + config.server
        changes = true
      }

      if (changes === true) {
        fs.writeFileSync(configFile, JSON.stringify(config), { mode: 0o755 })
      }
    } catch (e) {
    }
  },
  _defaultConfig: {
    "id": "device-01",
    "name": "Device 1",
    "server": "server ip",
    "admin": "",
    "token": "apitoken"
  },
  getConfig () {
    let configFile = path.join(global.getUserDataPath(), 'config.json')
    if (fs.existsSync(configFile)) {
      let data = fs.readFileSync(configFile)
      try {
        config = JSON.parse(data.toString())
      } catch (e) {
        config = this._defaultConfig
      }
    } else {
      config = this._defaultConfig
    }

    if (config.admin.length > 0 && config.admin.indexOf('enc:') !== -1) {
      config.admin = cryptr.decrypt(config.admin.replace('enc:', ''))
    }

    return config
  },
  utils: {
    getExtension (filename) {
      var i = filename.lastIndexOf('.');
      return ((i < 0) ? '' : filename.substr(i)).toLowerCase()
    }
  }
}

module.exports = global
