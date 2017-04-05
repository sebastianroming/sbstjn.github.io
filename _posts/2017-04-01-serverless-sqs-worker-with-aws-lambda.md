---

layout: post
title: Serverless Amazon SQS Worker with AWS Lambda
published: true
date: 2017-04-01
permalink: /serverless-sqs-worker-with-aws-lambda.html
github: https://github.com/sbstjn/sqs-worker-serverless
description: Have you ever wondered how to process messages from SQS with AWS Lambda? Use a CloudWatch Schedule with Alarms on the queue length for auto-scaling!
image: /assets/images/posts/2017-04-01-serverless-sqs-worker-with-aws-lambda/splash.jpg
---

Have you ever wondered how to process messages from SQS without maintaining infrastructure? Amazon Web Services perfectly support SNS as a trigger for AWS Lambda functions, but with SQS you have to find a custom solution. This tutorial will show an experimental setup using [Serverless](https://serverless.com) to read messages from an SQS queue and build auto-scaling worker processes.

## AWS Lambda

It's no secret AWS Lambda is a great service. Deployed functions can be triggered by a broad variety of sources: *HTTP requests*, *SNS topics*, and *Alexa voice commands are* just a few to name. But if you want to use SQS as the source, you have to build something custom that processes new messages and scales based on the length of the queue.

Of course, you can easily deploy an application to EC2, or ECS and you have a solid and proven solution. But as we all prefer not having to monitor an application, a setup with one of Amazon's managed services is way more preferable.

A possible solution to tackle this could be an **AWS Lambda** function that is triggered whenever there is at least one message stored in SQS. You could configure **CloudWatch Alarms** to check for this, but then you would end up with a pretty huge delay before the worker starts processing the queue.

To make sure the delay between receiving a message and starting to process it is as short as possible, you need to invoke your AWS Lambda function every minute using CloudWatch Schedules, for example. This works pretty fine and seams reliable.

This setup using just a single `worker` function is fine unless your SQS queue contains more and more messages. With a growing number of messages to process you should think about ways to invoke more than one worker processes.

You can use DynamoDB to store information about how many worker processes should be invoked. The minimum for the configuration is – of course – one, but there is no limit to the maximum number. 

*Amazon limits Lambda functions to 200 concurrent invocations per second. If you expect a huge amount of messages and plan to process them in a short amount of time, make sure to contact Amazon first!*

**tl;dr:** You can find the [sqs-worker-serverless](https://github.com/sbstjn/sqs-worker-serverless) project on GitHub. It includes a [serverless](https://serverless.com) configuration to setup a system with the following flow:

- CloudWatch Alarms on queue length post to SNS
- SNS message triggers `scale` Lambda function
- Function `scale` updates configuration in DynamoDB 
- CloudWatch Schedule invokes `worker` every `x` minute(s)
- Function `worker` reads configuration from DynamoDB
- Function `worker` invokes `process` function(s)
- Function `process` retrieves messages from SQS

## Scaling with CloudWatch Alerts

Amazon offers a service called **CloudWatch Alarms** which can post messages to an SNS topics when certain metrics reach a threshold. As said before, this feature comes with delay, which is not suitable to recognize new messages in a queue but is enough to manage some configuration about scaling.

To update the number of desired worker processes, you should configure multiple alerts to send a message to SNS as soon as more than 100, 1000, or 2000 messages are queued.

![Scaling with CloudWatch Alerts and DynamoDB](/assets/images/posts/2017-04-01-serverless-sqs-worker-with-aws-lambda/scale.png)

For every SNS message, Amazon invokes the `scale` function, which knows how to update the scaling configuration in DynamoDB based on the alarm configuration. When the alarm for `more than 2000` messages fires, the `scale` functions adds `10` to the current configured number of child processes. As soon as the alarm is resolved and the `scale` function is invoked a second time, the number of child processes is decreased again.

## Worker with AWS Lambda

The entry point for the worker is an AWS Lambda function, which reads the current scaling configuration from **DynamoDB** and invokes the desired number of `process` functions to read the messages from SQS. This Lambda function is invoked by **CloudWatch Schedule** every minute.

![SQS Worker to invoke Lambda functions](/assets/images/posts/2017-04-01-serverless-sqs-worker-with-aws-lambda/worker.png)

Normally the worker function needs only a few seconds of runtime, as it does not wait for an answer of the invoked functions. The `process` functions take care of polling messages from SQS and will continue to poll for new messages until the timeout is about to be exceeded or the queue is empty.

I published the [lawos](https://github.com/sbstjn/lawos) package to NPM for easy polling of new message in SQS. The tool will check the remaining milliseconds and stops polling before the function runs into any timeout.

## Serverless for deployment

Thanks to [serverless](https://serverless.com) you do not need to configure this setup by hand in the AWS Console. Everything that is described in the setup above can be setup using built-in features and a few lines of CloudFormation.

To get started, just clone the [sqs-worker-serverless](https://github.com/sbstjn/sqs-worker-serverless) project from GitHub and deploy the stack to your AWS account:

```bash
$ > git clone git@github.com:sbstjn/sqs-worker-serverless.git
$ > cd sqs-worker-serverless
$ > npm install
$ > npm run deploy
```

[Serverless](https://serverless.com) is a great tool to deploy AWS Lambda functions, and does support CloudFormation templates for additional custom resources. This is how you create an SQS queue and DynamoDB table:

```yaml
resources:
  Resources:

    Messages:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:custom.sqs}
        MessageRetentionPeriod: 1209600
        VisibilityTimeout: 60
        RedrivePolicy:
          deadLetterTargetArn:
            Fn::GetAtt:
            - MessagesDeadLetterQueue
            - Arn
          maxReceiveCount: 10

    MessagesDeadLetterQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:custom.sqs}-dead-letter-queue
        MessageRetentionPeriod: 1209600

    Config:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.config}
        AttributeDefinitions:
          - AttributeName: key
            AttributeType: S
        KeySchema:
          - AttributeName: key
            KeyType: HASH
        ProvisionedThroughput:
          ReadCapacityUnits: 5
          WriteCapacityUnits: 5
```


Together with the built-in features the `serverless.yml` file stores all information about the needed components:

- SQS Queue with your messages (*of course*)
- SNS Topic to receive CloudWatch Alarms
- DynamoDB table to persist scale configuration
- CloudWatch Schedule as cron replacement
- Three (`scale`, `worker`, `process`) AWS Lambda functions

## Configure Alarms

To setup all needed CloudWatch Alarms to scale the worker processes I have written a custom serverless plugin called [sqs-alarms](https://github.com/sbstjn/serverless-sqs-alarms-plugin). With this plugins it's simple to configure Alarms on the queue length:

```yaml
sqs-alarms:
- queue: ${self:custom.sqs}
    topic: ${self:custom.sns}
    thresholds:
    - 1
    - 50
    - 100
    - 500
    - 1000
    - 5000
```

## Handle auto-scaling

Now it's time to head over to GitHub and have a look at the [included AWS Lambda functions](https://github.com/sbstjn/sqs-worker-serverless/tree/master/functions) how the auto-scaling is implemented. 

## Feedback

What do you think of this setup? Could you imagine to replace an existing worker setup with AWS Lambda? Is there a better way to process messages from SQS with serverless? Let me know and [send a reply on twitter](https://twitter.com/sbstjn).
