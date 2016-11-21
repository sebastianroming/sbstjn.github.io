---

layout: post
title: Manage notes from the command line with CLI Notes
published: true
date: 2016-11-21
permalink: /manage-notes-from-the-command-line-with-clinotes.html
image: /assets/images/sbstjn/07.jpg

---

On the past few friday evenings I started to write a side-project to get going with server and client development using Go. The result is the [CLI Notes](https://clinot.es) project for managing text notes from the command line. All code for hosting the API server and building the needed client application is available at [GitHub](https://github.com/clinotes) using the GPL license.

## What is CLI Notes ?

I always felt the need to create a simple tool to quickly write and store text notes from the command line:

![CLINotes](/assets/images/posts/2016-11-21-manage-notes-from-the-command-line/terminal.png)

The `cn` application sends your notes to the API server, so please make sure not to post any sensitive information unless you are hosting the server for yourself! But of course you are welcome to test-drive my running service at <a href="https://clinot.es">clinot.es</a> …

## Open Source

Of course the complete sources for running the API server using Heroku is online at GitHub. There are two repositories available, one for the backend and one for the command line application

 - [CLI Notes server](https://github.com/clinotes/server)
 - [CLI Notes client](https://github.com/clinotes/client)

Feel free to add some features, encryption for example ;)
