---

layout: post
title: Hosting on AWS S3, CloudFront and SSL Certificate Manager
published: true
permalink: /static-hosting-amazon-s3-cloudfront-and-ssl-certificate-manager.html
image: /assets/images/sbstjn/04.jpg

---

It's not a secret you can easily host any static website on Amazon S3 without cryptic configuration. When you add CloudFront for HTTPS delivery and the Amazon Certificate Manager for free SSL certificates you will get a neat setup.

 - [Create an Amazon S3 Bucket](#create-an-amazon-s3-bucket)
 - [Create an SSL Certificate](#create-an-ssl-certificate)
 - [Configure CloudFront](#configure-cloudfront)
 - [Use Route53 for DNS](#use-route53-for-dns)

With the [AWS free tier](https://aws.amazon.com/free/) you can store up to 5Gb of files and handle 20.000 `GET` requestson Amazon S3 each month for free. After the 12 months trial period the default [Amazon S3 pricing](https://aws.amazon.com/s3/) kicks in …

## Create an Amazon S3 Bucket

All you need to get started is an **Amazon S3** bucket, enable static website hosting and define a required `index` document. This can be all be achieved using the `aws` command line interface, so let's get started with creating a bucket for `notify.heft.io` with:

```
$ > aws s3api create-bucket \
--bucket notify.heft.io \
--region eu-west-1 \
--create-bucket-configuration LocationConstraint=eu-west-1
```

Now that we have created the S3 bucket to store all files, we need to enable the built-in Amazon S3 feature for hosting static websites and configure the default `index` document:

```
$ > aws s3 website s3://notify.heft.io/ \
--region eu-west-1 \
--index-document index.html
```

The first command already responded the public URL of the S3 bucket, in this case [notify.heft.io.s3.amazonaws.com](http://notify.heft.io.s3.amazonaws.com/). But no worries, we will be able to access the files in this bucket with a custom domain using Amazon **CloudFront** in the end.

As we do not plan to store any confidential data in the Amazon S3 bucket, we can just enable general public read access to all objects stored in it:

```
$ > aws s3api put-bucket-policy \
--bucket notify.heft.io \
--region eu-west-1 \
--policy '{
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "Allow Public Access to All Objects",
              "Effect": "Allow",
              "Principal": "*",
              "Action": "s3:GetObject",
              "Resource": "arn:aws:s3:::notify.heft.io/*"
          }
      ]
  }'
```

After creating the bucket, enabling static web hosting and configuring the access permission it's time upload the first content to the bucket. Let's just create two simple files called `index.html` and `error.html`, put some content in it and upload them to the S3 bucket:

```
$ > echo "Index" > dist/index.html
$ > aws s3 cp --region eu-west-1 \
dist/index.html \
s3://notify.heft.io/index.html

$ > echo "Error" > dist/error.html
$ > aws s3 cp --region eu-west-1 \
dist/error.html \
s3://notify.heft.io/error.html
```

After both uploads have finished the files are available in the S3 bucket with the configured access pattern. You should be able to send a request to both of them and receive the stored content.

```
$ > curl http://notify.heft.io.s3.amazonaws.com/index.html
Index

$ > curl http://notify.heft.io.s3.amazonaws.com/error.html
Error
```

Now there is a basic setup to host a static website and you could just start with uploading files to Amazon S3. But the S3 bucket shall use a custom domain and not some URL ending with `*.amazonaws.com`, and have an SSL certificate for secure access to the content over `HTTPS` as well. You can be lucky, Amazon introduced free SSL certificates with the **Amazon Certificate Manage** just a couple of weeks ago.

## Create an SSL Certificate

We need to request a certificate in ACM and Amazon will provide us with an identifier for the certificate which can be used to configure **CloudFront** to serve the files using `HTTPS`:

```
$ > aws acm request-certificate \
--domain-name notify.heft.io

{
    "CertificateArn": "arn:aws:acm:us-east-1:123456789123:certificate/…"
}
```

Write down that **ARN**, it will be needed for the CloudFront configuration. Amazon requires some kind of verification that you really own a domain, so we can trigger an verification email to `admin@heft.io` with the following command:

```
$ > aws acm resend-validation-email \
--certificate-arn "arn:aws:acm:us-east-1:198537873635:certificate/…" \
--domain notify.heft.io \
--validation-domain heft.io
```

Now check your inbox and click on `approve` in the mail Amazon did sent to your address. After approving the certificate we can use it with CloudFront; Other services like API Gateway will hopefully be added to the list of compatible services in the future.

## Configure CloudFront

The configuration for **CloudFront** is more complex than the previous commands, but the JSON contains all settings for using a custom domain with SSL and have all `HTTP` requests redirected to `HTTPS`. Please check the [Amazon CloudFront prices](https://aws.amazon.com/cloudfront/pricing/) first. The free tier comens with 50 GB data transfer and 2,000,000 requests each month for one year.

```
$ > aws cloudfront create-distribution \
 --region=eu-west-1 \
 --distribution-config '{
    "CallerReference": "notify.heft.io",
    "Comment": "", 
    "CacheBehaviors": {
        "Quantity": 0
    }, 
    "Logging": {
        "Bucket": "", 
        "Prefix": "", 
        "Enabled": false, 
        "IncludeCookies": false
    }, 
    "WebACLId": "", 
    "Origins": {
        "Items": [
            {
                "OriginPath": "", 
                "CustomOriginConfig": {
                    "OriginProtocolPolicy": "http-only", 
                    "HTTPPort": 80, 
                    "OriginSslProtocols": {
                        "Items": [
                            "TLSv1", 
                            "TLSv1.1", 
                            "TLSv1.2"
                        ], 
                        "Quantity": 3
                    }, 
                    "HTTPSPort": 443
                }, 
                "CustomHeaders": {
                    "Quantity": 0
                }, 
                "Id": "notify.heft.io", 
                "DomainName": "notify.heft.io.s3-website-eu-west-1.amazonaws.com"
            }
        ], 
        "Quantity": 1
    }, 
    "DefaultRootObject": "", 
    "PriceClass": "PriceClass_All", 
    "Enabled": true, 
    "DefaultCacheBehavior": {
        "TrustedSigners": {
            "Enabled": false, 
            "Quantity": 0
        }, 
        "TargetOriginId": "notify.heft.io", 
        "ViewerProtocolPolicy": "redirect-to-https", 
        "ForwardedValues": {
            "Headers": {
                "Quantity": 0
            }, 
            "Cookies": {
                "Forward": "none"
            }, 
            "QueryString": false
        }, 
        "MaxTTL": 31536000, 
        "SmoothStreaming": false, 
        "DefaultTTL": 86400, 
        "AllowedMethods": {
            "Items": [
                "HEAD", 
                "GET"
            ], 
            "CachedMethods": {
                "Items": [
                    "HEAD", 
                    "GET"
                ], 
                "Quantity": 2
            }, 
            "Quantity": 2
        }, 
        "MinTTL": 0, 
        "Compress": false
    }, 
    "ViewerCertificate": {
        "SSLSupportMethod": "sni-only", 
        "ACMCertificateArn": "arn:aws:acm:us-east-1:123456789123:certificate/…", 
        "MinimumProtocolVersion": "TLSv1", 
        "Certificate": "arn:aws:acm:us-east-1:123456789123:certificate/…", 
        "CertificateSource": "acm"
    }, 
    "CustomErrorResponses": {
        "Quantity": 0
    }, 
    "Restrictions": {
        "GeoRestriction": {
            "RestrictionType": "none", 
            "Quantity": 0
        }
    }, 
    "Aliases": {
        "Items": [
            "notify.heft.io"
        ], 
        "Quantity": 1
    }
}'
```

Amazon needs some time to distribute our CloudFront setup, but after a few minutes you can access the S3 bucket with a `*.cloudfront.net` subdomain.

## Use Route53 for DNS

To have Amazon answer requests for the custom `notify.heft.io` domain and use the previously created SSL certificate we need to add a `RecordSet` to the **Route53** configuration. The following `aws` API request depends on an already configured HostedZone in Route53 and creates a subdomain pointing to the CloudFront address:

```
$ > aws route53 change-resource-record-sets \
--hosted-zone-id Z5ADD5OALD2PL \
--change-batch '{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "notify.heft.io.",
				"Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z5ADD5OALD2PL",
          "DNSName": "dt4egtm72vk4z.cloudfront.net.",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}'
```

Now **Amazon Route53** knows how to handle requests to the custom domain `notify.heft.io` and to respond with the CloudFront distribution of the uploaded content from the S3 bucket. Together with the certificate from **Amazon Certificate Manager** this is a neat setup to host a static website using `HTTPS` without any maintenance. 

As we are all setup now you can finally send requests to `notify.heft.io` which will resond with our uploaded files:

```
$ > curl https://notify.heft.io/
Index

$ > curl https://notify.heft.io/error.html
Error
```

Always remember to invalidate the **CloudFront** cache after uploading changes to a S3 bucket! Of course Amazon supports *cache invalidation* using the `aws` command line interface, so you can easily integrate it in your deploy flow:

```
$ > aws cloudfront create-invalidation \
--distribution-id A3ER1GOP2FROL
--paths '/*'
```

Make sure to check out the [heft.io](https://github.com/heft/heft.io) repository on GitHub to see how this works when using a `.travis.yml` configuration for [Travis CI](https://travis-ci.org/) …