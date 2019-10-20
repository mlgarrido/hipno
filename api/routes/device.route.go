package routes

import (
  "github.com/zombcode/cardamomo"
  "fmt"
)

type Device struct {
  ID string `json:"id"`
  Name string `json:"name"`
  Socket *cardamomo.SocketClient `json:"-"`
}

var devices map[string]Device

func DeviceRoute(router *cardamomo.Router) {

  fmt.Printf("")

  if devices == nil {
    devices = make(map[string]Device, 0)
  }

  router.Get("/list", func(req cardamomo.Request, res cardamomo.Response) {
    res.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    res.Writer.Header().Set("Access-Control-Allow-Headers", "Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With")

    res.SendJSON(
      cardamomo.JSONC{
        "success": true,
        "data": cardamomo.JSONC{
          "devices": devices,
        },
      },
    )
  })
}
