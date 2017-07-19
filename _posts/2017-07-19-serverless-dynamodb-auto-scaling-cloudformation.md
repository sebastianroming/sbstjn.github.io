---
layout: post
title: Serverless DynamoDB Auto Scaling with CloudFormation
published: true
date: 2017-07-19
permalink: /serverless-dynamodb-auto-scaling-with-cloudformation.html
description: >-
  Configure Amazon's native DynamoDB Auto Scaling using Serverless and 
  CloudFormation with this Plugin for the Serverless Framework.
image: >-
  /assets/images/posts/dynamodb_autoscaling.jpg
github: 'https://github.com/sbstjn/serverless-dynamodb-autoscaling'
---

Since a few days, Amazon provides a native way to enable Auto Scaling for DynamoDB tables! Luckily the settings can be configured using CloudFormation templates, and so I wrote a [plugin for serverless](https://github.com/sbstjn/serverless-dynamodb-autoscaling) to easily configure Auto Scaling without having to write the whole CloudFormation configuration.

You can find the [serverless-dynamodb-autoscaling on GitHub](https://github.com/sbstjn/serverless-dynamodb-autoscaling) and [NPM](https://www.npmjs.com/package/serverless-dynamodb-autoscaling) as well. Just install it using `npm` or `yarn` and add it to our `serverless.yml` configuration:

```
plugins:
  - serverless-dynamodb-autoscaling

custom:
  capacities:
    - name: custom-table  # DynamoDB table name
      read:
        minimum: 5        # Minimum read capacity
        maximum: 1000     # Maximum read capacity
        usage: 0.75       # Usage percentage
      write:
        minimum: 40
        maximum: 200
        usage: 0.5
```

After your next deployment, Amazon will configure native Auto Scaling for your DynamoDB table. Before the native support from Amazon, you had to handle Auto Scaling on your own, with a custom AWS Lambda function for example. But those times a finally over!
