---
layout: post
title: Process Serverless CloudFormation Stack Output
published: true
date: 2017-07-1
permalink: /process-serverless-cloudformation-stack-after-deploy.html
description: >-
  With this plugin for Serverless you can easily process your CloudFormation
  Stack Output with custom JavaScript, or save it in a TOML/YAML/JSON file.
image: >-
  /assets/images/posts/IMG_1559.jpg
github: 'https://github.com/sbstjn/serverless-stack-output'
---
When you use a serverless environment for your service ([and you should!](https://datafloq.com/read/7-reasons-serverless-computing-revolution-cloud/2871)), chances are high you might be using the [Serverless framework](https://serverless.com) and may end up in a situation like me with the need to process the AWS CloudFormation Stack Output after deploying the service.

[Serverless](https://serverless.com) uses CloudFormation to describe the AWS Stack that is deployed. Thanks to this you can just extend the existing [Serverless](https://serverless.com) features with custom resources and basically everything Amazon supports in CloudFormation. 

With the [serverless-stack-output](https://github.com/sbstjn/serverless-stack-output) plugin you can easily process your CloudFormation Stack Output with a custom JavaScript function, or save it in a TOML/YAML/JSON configuration file.

## Configuration

Just install the [serverless-stack-output](https://github.com/sbstjn/serverless-stack-output) plugin using `npm` or `yarn` and extend your `serverless.yml` configuration with the needed information:

```
plugins:
 - serverless-stack-output

custom:
  output:
    handle: scripts/output.process
    file: .build/output.json
```

## Function

The plugin can call a custom JavaScript function after the Stack is deployed and will pass a data object with the Stack Output. To configure a function, use the `handle` configuration like shown in the example above and create a `scripts/output.js` file with the following content:

```js
function process (data) {
  console.log('Received Stack Output', data)
}

module.exports = { process }
```

## Storage

You can choose to write all Stack Outputs in a configuration file with the `file` property. The plugin already supports the JSON, YAML, and TOML formats! Just use the file extension matching the format and the plugin will take care of the rest.

It should not be that hard to extend the current formats with a custom one, just have a look at the `src/file.js` implementation on GitHub …
