---
layout: post
title: AWS Lambda with MaxMind GeoLite2 IP database
published: true
date: 2017-11-03
permalink: /aws-lambda-geoip-location-maxmind.html
description: >-
  Deploy your own service to lookup the geo location of IP addresses using AWS Lambda and the MaxMind GeoLite2 City IP database.
image: >-
  /assets/images/posts/serverless_geoip.jpg
github: 'https://github.com/sbstjn/serverless-geoip'
---

You can easily deploy your very own API endpoint to lookup IP addresses for geo information using AWS Lambda. The [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geoip2/geolite2/) database is somehow the open standard when you need to get the geographical location of an IP address.

Together with the [mmdb-reader](https://github.com/gosquared/mmdb-reader) NPM package, you can deploy a service using [serverless](https://serverless.com) to AWS Lambda. Thanks to AWS Lambda you can use the deployed function within other AWS Lambda functions, or as an HTTP API in the end.

Just clone the [serverless-geoip](https://github.com/sbstjn/serverless-geoip) project from GitHub and install all (*just two*) the needed dependenccies:

```
$ > git clone git@github.com:sbstjn/serverless-geoip.git
$ > cd serverless-geoip
$ > yarn install
```

Afterwards, download the [GeoLite2 City](http://dev.maxmind.com/geoip/geoip2/geolite2/) database and store the file inside the `data` folder.

```bash
.
└── data
    └── GeoLite2-City.mmdb
```

You can now deploy the project with serverless and send HTTP requests using cURL to lookup the geographical location of an IP address:


```bash
$ > curl https://randomid.execute-api.us-east-1.amazonaws.com/dev/ip/8.8.8.8

{"continent":{"code":"NA","geoname_id":6255149,"names":{"de":"Nordamerika","en":"North America", …
```

In the beginning I thought about caching the result in a DynamoDB, or Redis but querying the database is fast enough for now …