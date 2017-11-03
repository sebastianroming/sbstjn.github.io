---
layout: post
title: AWS Lambda with MaxMind GeoLite2 IP database
published: true
date: 2017-11-03
permalink: /aws-lambda-geoip-location-maxmind.html
description: >-
  Deploy your own service to lookup the geo location of an IP address using AWS Lambda and the MaxMind GeoLite2 City IP database.
image: >-
  /assets/images/posts/serverless_geoip.jpg
github: 'https://github.com/sbstjn/serverless-geoip'
---

The [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geoip2/geolite2/) database is basically the standard solution when you need to get the geo information for an IP address. Together with the [mmdb-reader](https://github.com/gosquared/mmdb-reader) NPM package you can easily deploy your own [serverless](https://serverless.com) API to AWS Lambda to lookup locations for IP addresses.

Thanks to AWS Lambda the deployed function can be used by other Lambda functions, or via HTTP using Amazon's API Gateway.

## Configuration

Just clone the [serverless-geoip](https://github.com/sbstjn/serverless-geoip) project from GitHub and install the needed dependencies:

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

## Usage

You can now deploy the project with [serverless](https://serverless.com) and send HTTP requests using cURL to lookup the geographical location of an IP address:

```bash
$ > yarn deploy

…

endpoints:
  GET - https://randomid.execute-api.us-east-1.amazonaws.com/dev/ip/{ip}

$ > curl https://randomid.execute-api.us-east-1.amazonaws.com/dev/ip/8.8.8.8

{"continent":{"code":"NA","geoname_id":6255149,"names":{"de":"Nordamerika","en":"North America", …
```

First I thought about caching the result in a DynamoDB or Redis, but querying the database is fast enough for now …