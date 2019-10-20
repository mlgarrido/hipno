package routes

import (
  "github.com/zombcode/cardamomo"
)

var sockets map[string]string

func HipnoSocket (socketClient *cardamomo.SocketClient) {
  if sockets == nil {
    sockets = make(map[string]string, 0)
  }

  if devices == nil {
    devices = make(map[string]Device, 0)
  }

  /**********************/
  /** CONNECTION CYCLE **/
  /**********************/

  socketClient.OnSocketAction("onDisconnect", func(sparams map[string]interface{}) {
    delete(devices, sockets[socketClient.GetID()])
    delete(sockets, socketClient.GetID())
  })

  /**********/
  /** INIT **/
  /**********/

  socketClient.OnSocketAction("initialize", func(sparams map[string]interface{}) {
    if sparams["token"] != nil {
      if sparams["token"].(string) == Server.Config["security"].(map[string]interface{})["token"].(string) {
        sockets[socketClient.GetID()] = sparams["device"].(map[string]interface{})["id"].(string)
        devices[sparams["device"].(map[string]interface{})["id"].(string)] = Device{
          ID: sparams["device"].(map[string]interface{})["id"].(string),
          Name: sparams["device"].(map[string]interface{})["name"].(string),
          Socket: socketClient,
        }
        socketClient.Send("initialized", cardamomo.JSONC{"success": true})
      } else {
        socketClient.Send("initialized", cardamomo.JSONC{"success": false, "error": "U100", "extra": cardamomo.JSONC{"token": sparams["token"].(string)}})
      }
    } else {
      socketClient.Send("initialized", cardamomo.JSONC{"success": false, "error": "C100"})
    }
  })

}
