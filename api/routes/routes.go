package routes

import (
  "github.com/zombcode/cardamomo"
  "fmt"
  "io/ioutil"
  "encoding/json"
  "runtime"
  "path"
  "net/http"
)

type ServerData struct {
  Config map[string]interface{}
}

var Server ServerData
var Socket *cardamomo.Socket

func NewServer() ServerData {
  configFile, err := ioutil.ReadFile("carfig.json")
  if err != nil {
    // Error
    fmt.Printf("\n\nError reading carfig.json: %s\n\n", err)

    return ServerData{}
  }

  var config map[string]interface{}
  json.Unmarshal(configFile, &config)

  return ServerData{Config:config}
}

var socket *cardamomo.Socket

func Start() {
  // Create new server
  Server = NewServer()

  // Instanciate "cardamomo"
  c := cardamomo.Instance(Server.Config["port"].(string))
  c.SetDevDebugMode(Server.Config["debug"].(bool))

  // Generate routes
  c.Base("/device", DeviceRoute)
  c.Base("/control", ControlRoute)

  // Static routes
  _, filename, _, ok := runtime.Caller(0)
  if !ok {
    panic("No caller information")
  }
	http.Handle("/statics/", http.StripPrefix("/statics/", http.FileServer(http.Dir(path.Clean(path.Dir(filename) + "/../statics")))))

  // Start socket
  Socket = c.OpenSocket()
	Socket.OnSocketBase("/hipno", HipnoSocket)

  // Error handler
  c.SetErrorHandler(func (code string, req cardamomo.Request, res cardamomo.Response) {
    res.Writer.Header().Set("Access-Control-Allow-Origin", "*")
    res.Writer.Header().Set("Access-Control-Allow-Headers", "Accept,Authorization,Cache-Control,Content-Type,DNT,If-Modified-Since,Keep-Alive,Origin,User-Agent,X-Mx-ReqToken,X-Requested-With")

		if( code == "404" ) {
      fmt.Println("Respond with error: %s", code)
      
			res.SendJSON(cardamomo.JSONC{
        "success": false,
        "error": "404",
      });
		}
	})

  // Run cardamomo
  c.Run()
}

// GET IP

func GetIP(req *http.Request) (ip string) {
  // Client could be behid a Proxy, so Try Request Headers (X-Forwarder)
  ipSlice := []string{}

  ipSlice = append(ipSlice, req.Header.Get("X-Forwarded-For"))
  ipSlice = append(ipSlice, req.Header.Get("x-forwarded-for"))
  ipSlice = append(ipSlice, req.Header.Get("X-FORWARDED-FOR"))

  for _, v := range ipSlice {
    if v != "" {
      return v
    }
  }

  return ""
}
