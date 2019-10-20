const WebSocket = require('ws')

let Cardamomo = function () {
  this.socket = (path) => {

    let id = ""
    let destroyed = false
    let opened = false

    let _socket = null
    let _actions = {}
    let _onOpen = null
    let _onClose = null
    let self = this

    self.openSocket = (path) => {
      let wsPath = path
      wsPath = wsPath.replace('http://', 'ws://')
      wsPath = wsPath.replace('https://', 'wss://')

      if( wsPath.indexOf('ws://') === -1 && wsPath.indexOf('wss://') === -1 ) {
        wsPath = 'ws://' + wsPath
      }

      wsPath = wsPath.replace(/\s/g, '')

      self.error = false
      self.destroyed = false

      _socket = new WebSocket(wsPath, {
        origin: path
      })

      _socket.onerror = (function (event) {
        self.error = true
      })

      _socket.onopen = (function (event) {
        self.send("CardamomoSocketInit", "{}")
      })

      _socket.onmessage = function (event) {
        try {
          let data = JSON.parse(event.data)
          if( data.Action == "CardamomoSocketInit" ) {
            self.id = data.Params.id

            if(_onOpen != null) {
              _onOpen(self.opened)
            }

            self.opened = true

            self.ping()
          } else if( data.Action == "CardamomoPong" ) {
            // Pong
          } else {
            if( data.Action in _actions ) {
              for (let i in _actions[data.Action]) {
                _actions[data.Action][i](data.Params)
              }
            }
          }
        } catch(e) {}
      }

      _socket.onclose = (function (event) {
        if(_onClose != null) {
          _onClose(self.error, self.destroyed)
        }
        // Try to reconnect in 5 seconds
        if (self.destroyed === false) {
          setTimeout((function () {
            self._socket = null
            self.openSocket(path)
          }).bind(path), 5000)
        }
      }).bind(path)
    }

    function onMessage(action, callback) {
      if( !(action in _actions) ) {
        _actions[action] = []
      }

      _actions[action].push(callback)
    }

    function send(action, params) {
      let message = {
        "action": action,
        "params": JSON.stringify(params)
      }

      message = JSON.stringify(message)
      _socket.send(message)
    }

    function ping() {
      if( self.destroyed == false ) {
        self.send("CardamomoPing", "{}")

        setTimeout(function () {
          self.ping()
        }, self.pingTime)
      }
    }

    function destroy() {
      self.destroyed = true
      _socket.close()
    }

    this.onOpen = function(callback) {
      _onOpen = callback
    }
    this.onClose = function(callback) {
      _onClose = callback
    }
    this.on = onMessage
    this.send = send
    this.ping = ping
    this.pingTime = 10000
    this.destroy = destroy

    this.openSocket(path)

    return this
  }

  return this
}

module.exports = Cardamomo
