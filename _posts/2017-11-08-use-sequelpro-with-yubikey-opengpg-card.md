---
layout: post
title: Use SequelPro with OpenPGP cards like a YubiKey
published: true
date: 2017-11-08
permalink: /use-sequelpro-with-yubikey-opengpg-card.html
description: >-
  The YubiKey is a great OpenGPG smart card, but sadly some macOS applications (like Sequel Pro) 
  have troubles using the custom GPG/SSH agent for authentication.
image: >-
  /assets/images/posts/2017-11-08-use-sequelpro-with-yubikey-opengpg-card/splash.jpg

---

The [YubiKey](https://www.yubico.com/products/yubikey-hardware/yubikey4/) is a great OpenGPG smart card compatible hardware device. I use my YubiKey to store my private GnuPG key and for authenticating SSH connections. A few applications, however, don't work with the OpenGPG card and require a file containing the key per default; Sequel Pro is one of them.

Luckily I stumbled upon an older [issue at GitHub](https://github.com/sequelpro/sequelpro/issues/2619) with a neat workaround using Automator in macOS.

# The Basics

Together with the latest [GPG Suite for macOS](https://gpgtools.org/), the configuration is not more complex than adding a line to your `.bash_rc` or  `.zshrc` file:

```
export SSH_AUTH_SOCK=/Users/sbstjn/.gnupg/S.gpg-agent.ssh
```

This tells your SSH application to use the GPG Agent for any authentication requests. So when you run `ssh user@host`, a prompt will ask you for your smart card pin instead. Awesome!

# Automator

Use Automator in macOS to create a new application and configure Automator to run a shell script containing the following lines:

```bash
source ~/.zshrc
/Applications/Sequel\ Pro.app/Contents/MacOS/Sequel\ Pro
```

![Automator: Create Application](/assets/images/posts/2017-11-08-use-sequelpro-with-yubikey-opengpg-card/automator-application.png)

![Automator: Run Shell Script](/assets/images/posts/2017-11-08-use-sequelpro-with-yubikey-opengpg-card/automator-run-shell.png)

*This post is mostly a reminder for my future self how to setup macOS, Sequel Pro, and a YubiKey to access MySQL databases using an SSH tunnel.*