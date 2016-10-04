---

layout: post
title: Publish Go binary to Amazon S3 and Homebrew
published: true
date: 2016-08-30
permalink: /publish-golang-binary-to-s3-and-homebrew.html
image: /assets/images/sbstjn/04.jpg
redirect_from:
  - /publish-golang-binary-to-s3-and-homebrew

---

After the setup of a [go command line tool with Cobra](https://sbstjn.com/create-golang-cli-application-with-cobra-and-goxc.html) it's now time to release it to the public and publish it to Homebrew for easy installation on MacOS. Together with the steps to [use AWS S3, CloudFront and SSL Certificate Manager for easy web hosting](https://sbstjn.com/static-hosting-amazon-s3-cloudfront-and-ssl-certificate-manager.html#create-an-ssl-certificate.html) it's a pretty neat setup for your Homebrew application formula and go binary.

- [Prepare an Amazon S3 bucket](#prepare-an-amazon-s3-bucket)
- [Configure goxc](#configure-goxc)
- [Extend the Makefile](#extend-the-makefile)
- [Create Homebrew Formular](#create-homebrew-formular)


## Prepare an Amazon S3 bucket

The created [`heft` CLI application](https://github.com/heft/cli) has a command called `version` which responds with `v0.0.3` as the built version. The `Makefile` uses `goxc` to build a binary stored in `build/` and now we want to create an Amazon S3 bucket to store the binary for public access:

```bash
$ > aws s3api create-bucket \
--bucket downloads.heft.io \
--region eu-west-1 \
--create-bucket-configuration LocationConstraint=eu-west-1
```

Now that we have created the S3 bucket to store all files, we need to enable the built-in Amazon S3 feature for hosting static websites and configure the default `index` document:

```bash
$ > aws s3 website s3://downloads.heft.io/ \
--region eu-west-1 \
--index-document index.html
```

The first command already responded with the public URL of the S3 bucket, in this case [downloads.heft.io.s3.amazonaws.com](http://downloads.heft.io.s3.amazonaws.com). But no worries, we will be able to access the files in this bucket with a custom domain using Amazon CloudFront in the end.

As we do not plan to store any confidential data in the Amazon S3 bucket, we can just enable general public read access to all objects stored in it:

```bash
$ > aws s3api put-bucket-policy \
--bucket downloads.heft.io \
--region eu-west-1 \
--policy '{
      "Version": "2012-10-17",
      "Statement": [
          {
              "Sid": "Allow Public Access to All Objects",
              "Effect": "Allow",
              "Principal": "*",
              "Action": "s3:GetObject",
              "Resource": "arn:aws:s3:::downloads.heft.io/*"
          }
      ]
  }'
```

All needed steps to have a custom domain, use SSL and CloudFront for caching can be found in the post about [hosting on AWS S3, CloudFront with SSL Certificate Manager](https://sbstjn.com/static-hosting-amazon-s3-cloudfront-and-ssl-certificate-manager.html#create-an-ssl-certificate.html).

## Configure goxc

Now head over to the [goxc configuration from the previous tutorial](https://sbstjn.com/create-golang-cli-application-with-cobra-and-goxc.html) of our go application and remove  `copy-resources` from the list of excluded tasks:

```json
{
  "AppName": "heft",
  "ConfigVersion": "0.9",
  "ResourcesExclude": "LICENSE",
  "BuildSettings": {
    "LdFlags": "-s",
    "LdFlagsXVars": {
      "Version": "main.VERSION"
    }
  },
  "Tasks": [
    "interpolate-source",
    "default"
  ],
  "TasksExclude": [
    "rmbin",
    "deb",
    "deb-dev",
    "downloads-page",
    "go-vet",
    "go-test"
  ]
}
```

Building the project with `make build` will create a binary file and a compressed archive in the `build/` directory:

```
$ > make build
$ > tree build

build
└── 0.0.3
    ├── darwin_amd64
    │   └── heft
    └── heft_0.0.3_darwin_amd64.zip
```

## Extend the Makefile

The binary file is needed for the `make install` command and the compressed archive will be used for [Homebrew](http://brew.sh/). As we do not handle any sensitive information we can upload the complete `build/` folder to the S3 bucket. For easy usage extend the `Makefile` with a `publish` command:

```bash
publish: build
	aws s3 sync $(PATH_BUILD)/$(VERSION) s3://$(S3_BUCKET_NAME)/$(VERSION)
```

The S3 bucket name is new a variable which should be added to the top of our Makefile as well:

```bash
S3_BUCKET_NAME=downloads.heft.io
```

You can now call `make publish` and all compiled files of the current version are uploaded to Amazon S3.

## Create Homebrew Formular

Homebrew is a widely used package manager for MacOS. It relies intensively on GitHub repositories for package management. Within the repository Homebrew uses **Ruby** classes called `Formula`. The `Formula` contains information about the application name, the URL where to download the archived binary and an `SHA256` checksum for validation:

```ruby
class Heft < Formula
  desc "Heft.io command line interface"
  homepage "https://heft.io"
  url "https://s3-eu-west-1.amazonaws.com/downloads.heft.io/0.0.3/heft_0.0.3_darwin_amd64.zip"
  version "0.0.3"
  sha256 "103b8b15fecdccfaaf0db70b773650798e930511378f456292c0592734b98a82"

  def install
    bin.install "heft"
  end
end
```

On MacOS you can easily generate the needed `SHA256` checksum with the `shasum` command.

```bash
$ > shasum -a256 build/0.0.3/heft_0.0.3_darwin_amd64.zip
103b8b15fecdccfaaf0db70b773650798e930511378f456292c0592734b98a82  build/0.0.3/heft_0.0.3_darwin_amd64.zip
```

To store your **Formula** just create a [new and empty GitHub repository](https://github.com/heft/homebrew-cli/) and create a `Formula` directory with a `.rb` file named after the application name, in this case it's called `heft.rb`:

```bash
$ > tree .

.
├── Formula
│   └── heft.rb
└── README.md
```

After pushing the ruby file to your GitHub repository it's time to register the custom Formula in Homebrew, just run the following command to `tap` your namespace and repository:

```bash
$ > brew tap heft/cli git@github.com:heft/homebrew-cli.git
```

Now you can install the binary using Homebrew:

```bash
$ > brew install heft
```

The complete Homebrew Formula of the `heft` Command Line Application is [available on GitHub](https://github.com/heft/homebrew-cli/) for free.
