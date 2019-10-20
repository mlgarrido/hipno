package routes

import (
  "github.com/zombcode/cardamomo"
  "fmt"
)

func ControlRoute(router *cardamomo.Router) {

  fmt.Printf("")

  router.Get("/:action/:id", func(req cardamomo.Request, res cardamomo.Response) {
    res.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    res.Writer.Header().Set("Access-Control-Allow-Headers", "Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With")

    action := req.GetParam("action", "")
    id := req.GetParam("id", "")

    if device, ok := devices[id]; ok {
      device.Socket.Send("control:" + action, cardamomo.JSONC{})

      res.SendJSON(
        cardamomo.JSONC{
          "success": true,
          "data": cardamomo.JSONC{
            "device": device,
          },
        },
      )
    } else {
      res.SendJSON(
        cardamomo.JSONC{
          "success": false,
          "error": cardamomo.JSONC{
            "code": "D100",
            "details": "Invalid device",
          },
        },
      )
    }
  })
}
