---

layout: post
title: Serverless Amazon SQS Worker with AWS Lambda
published: true
date: 2017-03-31
permalink: /serverless-sqs-worker-with-aws-lambda.html
github: https://github.com/sbstjn/sqs-worker-serverless
description: Have you ever wondered how to process messages from SQS with AWS Lambda functions? Use a CloudWatch Schedule with Alarms on the queue length for auto-scaling!
image: /assets/images/posts/2017-03-31-serverless-sqs-worker-with-aws-lambda/splash.jpg
---

Have you ever wondered how to process messages from SQS without maintaining infrastructure? Amazon Web Services perfectly support SNS as a trigger for AWS Lambda functions, but with SQS you have to find a custom solution. This tutorial will show a setup using [Serverless](https://serverless.com) to read messages from an SQS queue.

## AWS Lambda

It's no secret AWS Lambda is a great service. Deployed functions can be triggered by a broad variety of sources: HTTP requests, SNS topics, and Alexa voice commands are just a few to name. But if you want to use SQS as the source, you have to build something custom that processes new messages and scales based on the length of the queue.

Of course, you can easily deploy an application to EC2, or ECS and you have a solid solution. But as we all prefer not having to monitor an application, a setup with Amazon's manages service is more preferable.

A possible solution to tackle this could be an AWS Lambda function that is triggered whenever there is at least one message in SQS. You could configure CloudWatch Alarms to check for this, but then you would end up with a pretty huge delay before the worker starts processing the queue.

To make sure the delay between receiving a message and starting to process it is as short as possible, you need to have your AWS Lambda function invoked every minute using CloudWatch Schedules. This works pretty fine and is very reliable.

This setup with a single `worker` function is fine unless your SQS queue contains more and more messages. With a growing number of messages to process you should think about a way to invoke more than one worker processes.

You can use DynamoDB to store an information about how many worker processes should be invoked for example. The minimum for the configuration is – of course – one, but there is no limit to the maximum number. Amazon tends to limit Lambda invocations to 100 per second, so if you expect a huge amount of message and plan to process them in a short amount of time, make sure to contact Amazon first.

**tl;dr:** You can find the [sqs-worker-serverless](https://github.com/sbstjn/sqs-worker-serverless) project on GitHub. It includes a [serverless](https://serverless.com) configuration to setup a system with the following flow:

- CloudWatch Alarms on queue length post to SNS
- SNS Topic triggers `scale` Lambda function
- Function `scale` updates configuration in DynamoDB 
- CloudWatch Schedule invokes `worker` every `x` minute(s)
- Function `worker` reads configuration from DynamoDB
- Function `worker` invokes `process` function(s)

Summarized you need the following resources in AWS:

- SQS Queue with your messages
- SNS Topic to handle CloudWatch Alarms
- DynamoDB table to persist configuration
- CloudWatch Schedule as cron replacement
- Three (`scale`, `worker`, `process`) AWS Lambda functions

## Scaling with CloudWatch Alerts

Amazon offers a service called **CloudWatch Alarms** which can post messages to an SNS topics when certain metrics reach a threshold. As said before, this feature comes with delay, which is not suitable to recognize new messages in a queue but is enough to manage some configuration about scaling.

To update the number of desired worker processes, you should configure multiple alerts to send a message to SNS as soon as more than 100, 1000, or 2000 messages are queued.

![Scaling with CloudWatch Alerts and DynamoDB](/assets/images/posts/2017-03-31-serverless-sqs-worker-with-aws-lambda/scale.png)

For every SNS message, Amazon should invoke the `scale` function, which knows how to update the scaling configuration in DynamoDB based on the alarm configuration. When the alarm for `more than 2000` messages fires, the `scale` functions adds `10` to the current configured number of child processes. As soon as the alarm is resolved and the `scale` function is invoked again, the number of child processes is decreased.

## Worker with AWS Lambda

The entry point for the worker is a Lambda function, which reads the current scaling information from **DynamoDB** and invokes the desired number of `process` functions to read the messages from SQS. This Lambda function is invoked by **CloudWatch Schedule** every minute.

![SQS Worker to invoke Lambda functions](/assets/images/posts/2017-03-31-serverless-sqs-worker-with-aws-lambda/worker.png)

Normally the worker function needs only a few seconds of runtime, as it does not wait for an answer of the invoked functions. The `process` functions take care of polling messages from SQS and will continue to poll for new messages until the timeout is about to be exceeded or the queue is empty.

I published the [lawos](https://github.com/sbstjn/lawos) package to NPM for easy polling of new message in SQS. The tool will check the remaining milliseconds and stop polling before the function runs into any timeout.

## Serverless for deployment

Thanks to [serverless](https://serverless.com) you do not need to configure this setup by hand. Everything that is described in the setup above can be achieved using built-in features and a few lines of custom CloudFormation template.