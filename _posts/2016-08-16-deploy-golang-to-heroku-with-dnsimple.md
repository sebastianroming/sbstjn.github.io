---

layout: post
title: Use Golang at Heroku and free SSL from CloudFlare.com
published: true
date: 2016-08-16
permalink: /use-golang-at-heroku-and-free-ssl-certificate-from-cloudflare.html
image: /assets/images/sbstjn/04.jpg
redirect_from:
  - /use-golang-at-heroku-and-free-ssl-certificate-from-cloudflare


---

It only takes a couple of minutes to deploy a [go application](https://golang.org/) to a free [Heroku](https://heroku.com) dyno, use a custom domain name and enable free SSL using [CloudFlare](https://www.cloudflare.com/). If you still have some seconds left *- and you will -* it's dead simple to add [Prometheus](https://prometheus.io/) metrics as well.

## Simple web server using go and gin

For easy HTTP handling the go application will make use of the [gin web server](https://github.com/gin-gonic/gin) framework. The following lines are everything needed to have an application respond to HTTP requests:

```go
package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "Welcome!")
	})

	r.Run("localhost:5000")
}
```
Just create a new folder, in this case `mtrs.io` and store the lines above into a file called `main.go` and you are done. After saving the file you are able to start the gin server with `go run main.go` and see a lovely welcome message when you open a web browser and point it to [localhost:5000](http://localhost:5000). Well, that was fast …

## Configure prometheus client library

As said in the introduction the new application must of course collect metrics, for example the number of requests to the `/` ressource. Using the [prometheus client library for go](https://github.com/prometheus/client_golang) it's pretty easy to create a new counter and configure the label `path` in order to handle future requests other than `/` :

```go
var (
	requestCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Namespace: "mtrs",
			Name:      "request",
			Help:      "Total number of requests",
		},
		[]string{"path"},
	)
)

func init() {
	prometheus.MustRegister(requestCounter)
}
```

After the configuration and registration of the counter you need to configure the route handler to increase `requestCounter` every time the application responds to a requests:

```go
r.GET("/", func(c *gin.Context) {
  c.String(http.StatusOK, "Done.")
  requestCounter.WithLabelValues("/").Inc()
})
```

Prometheus uses a [pull-workflow](https://prometheus.io/docs/introduction/faq/#why-do-you-pull-rather-than-push?), so the application needs an HTTP endpoint which can be crawled by a prometheus backend. This endpoint should be kind of secured and luckily [gin](https://github.com/gin-gonic/gin) already supports `BasicAuth` . With the simple syntax it's easy create the credentials and secure the prometheus endpoint at `/metrics` .

```go
r.Group("/metrics", gin.BasicAuth(gin.Accounts{
  "prometheus": "secret",
})).GET("/", func(c *gin.Context) {
  prometheus.Handler().ServeHTTP(c.Writer, c.Request)
})
```

If you now start the application again with `go run main.go` and point your browser to [localhost:5000/metrics](#) you will be asked for a username and password. The code above uses the user `prometheus` and the password `secret` . After sending a couple of requests to the configured `/` route you will see the counter value in the metrics:

```text
# HELP mtrs_request Total number of requests
# TYPE mtrs_request counter
mtrs_request{path="/"} 4
```

To get started with running a prometheus backend, just follow the official [installation guide using Docker](https://prometheus.io/docs/introduction/install/#using-docker). The required configuration is stored inside the [prometheus.yml](https://prometheus.io/docs/operating/configuration/) file.

```yaml
scrape_configs:
  - job_name: 'mtrs-development'
    scrape_interval: 5s
    basic_auth:
      username: prometheus
      password: secret
    static_configs:
      - targets: ['127.0.0.1:5000']
```

As you can see the YAML configuration is again not that complex and it can easily be extended to support the production application beside the development environment as soon as the application is running on the final custom domain.

## Deploy application to Heroku

The first steps are completed now and the go project with a gin web server is collecting metrics using the offical prometheus golang client library.

It's time to commit the created files to a [git repository](https://github.com/sbstjn/mtrs.io) and call the `Godep` command afterwars to install all needed librarys into the `ventor` folder.

```bash
$ > git add .
$ > git commit -m "Initial commit"
$ > godep save ./...
$ > git add .
$ > git commit -m "Add godeps"
```

With this default file pattern Heroku can detect the go application without extra configuration. Just create a `Procfile` with `web: mtrs.io` as the content and create a new Heroku application using the official command line tool:

```bash
$ > echo "web: mtrs.io" > Procfile
$ > heroku create
Creating app... done, warm-crag-52063
https://warm-crag-52063.herokuapp.com/ | https://git.heroku.com/warm-crag-52063.git
$ > heroku rename mtrs-io
$ > git push heroku master
$ > heroku open
```

After the deployment is done, you can open your browser and try to access [mtrs-io.herokuapp.com](https://mtrs-io.herokuapp.com) but all you will see is the default Heroku application error. Where did the lovely greeting go?

When the `main.go` file was created the gin router had been configured to listen on `localhost` on port `5000` , this has to be changed in order to use the application on Heroku:

```go
r.Run("localhost:5000")
```

Heroku will pass the required port number as an environment variable called `PORT`:

```go
func main() {
	port := os.Getenv("PORT")

	if port == "" {
		log.Fatal("$PORT must be set")
	} else {
		log.Print("Using port ", port)
	}

  […]

  r.Run(":" + port)
}
```

Add the changes to git, deploy them to Heroku and you should finally see the welcome message. Of course the prometheus metrics are available as well, secured with the same *BasicAuth* settings as before.

## Use custom domain with Heroku

Heroku has a built in support for customs domains. Just use the official Heroku command line tool and add the custom domain to the project:

```bash
$ > heroku domains:add mtrs.io
Adding mtrs.io to ⬢ mtrs-io... done
```

To test access from a custom domain register for a free [DNSimple.com](https://dnsimple.com) trial account and configure your existing domain to use the [DNSimple servers](https://support.dnsimple.com/articles/dnsimple-nameservers/). Obtain a [user access tokens](https://dnsimple.com/user) from the DNSimple profile settings and you can use the API to create the domain records:

```bash
curl  -H 'Authorization: Bearer YOUR_SECRET_BEARER_TOKEN' \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{"name": "mtrs.io"}' \
      https://api.dnsimple.com/v2/YOUR_ACCOUNT_ID/domains
```

After the domain has been created there needs to be an `ALIAS` record which points to the Heroku domain, in this case it's `mtrs-io.herokuapp.com`:

```bash
curl  -H 'Authorization: Bearer YOUR_SECRET_BEARER_TOKEN' \
      -H 'Accept: application/json' \
      -H 'Content-Type: application/json' \
      -X POST \
      -d '{"name": "","type": "ALIAS","content": "mtrs-io.herokuapp.com","ttl":600}' \
      https://api.dnsimple.com/v2/YOUR_ACCOUNT_ID/zones/mtrs.io/records
```

Now the gin web server runs on the free Heroku dyno and can be access using the custom domain, use `dig` to verify the changes:

```bash
$ > dig mtrs.io

;; ANSWER SECTION:
mtrs.io.		600	IN	A	23.21.231.39
```

After everything is set up it's time to add the production configuration to prometheus. Just configure a second `job_name` like the development environment and adjust the `targets` inside `static_configs` :

```yaml
- job_name: 'mtrs-production'
  scrape_interval: 5s
  basic_auth:
    username: prometheus
    password: secret
  static_configs:
    - targets: ['mtrs.io']
```

Sadly SSL is quite expensive at Heroku, but you can create an [account at CloudFlare.com](https://www.cloudflare.com/a/sign-up) and use the service with a free SSL certificate.

## Use CloudFlare.com for free SSL

Add your domain and wait for CloudFlare to scan the domain settings. Delete all records CloudFlare has detected and create a new `CNAME` record for `@` with the heroku URL `mtrs-io.herokuapp.com` as the value. Of course you want to make use of all the CloudFlare features, so disable DNS passthru and let CloudFlare handle all requests.

Now it's time to configure the nameserver for the domain again. Sadly you have to say good bye to DNSimple.com again and change the nameserver to the configuration CloudFlare provides:

```
Current Nameservers	   Change Nameservers to:
ns1.dnsimple.com	     gene.ns.cloudflare.com
ns2.dnsimple.com	     piotr.ns.cloudflare.com
ns3.dnsimple.com	     Remove this nameserver
ns4.dnsimple.com	     Remove this nameserver
```

As soon as the configuration has been deployed by the domain registrar CloudFlare should respond to requests at `mtrs.io` with some A records hosted somewhere in `104.*`:

```bash
$ > dig mtrs.io

;; ANSWER SECTION:
mtrs.io.		300	IN	A	104.24.103.167
mtrs.io.		300	IN	A	104.24.102.167
```

When the configured TTL from DNSimple.com has passed a `curl` request to the domain responds with header information from CloudFlare and shows the greeting of the go application:

```bash
$ > curl -i mtrs.io
domain=.mtrs.io; HttpOnly
Via: 1.1 vegur
Server: cloudflare-nginx
CF-RAY: 2da2352cf6204106-HAM

Done.
```

That's kind of the same setting you already achieved with DNSimple.com so let's configure free SSL for the custom domain. First create a new rule in CloudFlare for all HTTP requests matching `http://*mtrs.io*` to always use HTTPS:

![CloudFlare.com Rules - Redirect HTTP to HTTPS](https://sbstjn.com/assets/images/posts/cloudflare_rules.png)

Now every request to `http://mtrs.io` includes a `301 Moved Permanently` header and a `Location: https://mtrs.io` information:

```bash
$ > curl http://mtrs.io -i
HTTP/1.1 301 Moved Permanently
Location: https://mtrs.io/
```

A request to [https://mtrs.io](https://mtrs.io) may still fail, as CloudFlare needs some time to configure the SSL certificate for the domain:

```bash
curl https://mtrs.io
curl: (35) Unknown SSL protocol error in connection to mtrs.io:-9838
```

This usually takes about ten minutes to complete and is enabled per default. While waiting for the SSL certificate you could have a look at all the additional configuration CloudFlare.com offers and activate HTTP Strict Transport Security (HSTS) for example.
