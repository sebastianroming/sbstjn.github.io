---

layout: post
title: Create a Golang CLI application with Cobra and goxc
published: true
date: 2016-08-23
permalink: /create-golang-cli-application-with-cobra-and-goxc
image: /assets/images/sbstjn/04.jpg

---

With [Cobra](https://github.com/spf13/cobra) there exists an awesome and widely used library and generator for Command Line applications in Go. Together with [goxc](https://github.com/laher/goxc) you can create a neat setup to get started with CLI interactions.

First install Cobra with `go get` and initialize the command line project. In this case the go application is called `github.com/heft/cli` and after this tutorial it will feature one command to display the compiled version of the `heft` command.

```bash
$ > go get -v github.com/spf13/cobra/cobra
$ > $GOPATH/bin/cobra init github.com/heft/cli

Your Cobra application is ready at
/Users/sebastian/Workspace/src/github.com/heft/cli
Give it a try by going there and running `go run main.go`
Add commands to it by running `cobra add [cmdname]`
```

After the application is created you can use the `cobra` generator to add commands with `command add` . As said above the application should display its current version, so add a `version` command:

```bash
$ > $GOPATH/bin/cobra add version
```

Thanks to the [Cobra framework](https://github.com/spf13/cobra) everything is predefined and you can already use the project. Just run the source code and you will see basic instructions on how to use the new CLI application.

```bash
$ > go run main.go
A longer description that spans multiple lines and likely contains
examples and usage of using your application. For example:

Cobra is a CLI library for Go that empowers applications.
This application is a tool to generate the needed files
to quickly create a Cobra application.

Usage:
  cli [command]

Available Commands:
  version     A brief description of your command

Flags:
      --config string   config file (default is $HOME/.cli.yaml)
  -h, --help            help for cli
  -t, --toggle          Help message for toggle

Use "cli [command] --help" for more information about a command.
```

The project is stored in `github.com/heft/cli` so cobra uses `cli` as the default name. It's possible to change the name in the `root.go` file: Rename the file to `heft.go` and update the `RootCmd` configuration:

```go
var RootCmd = &cobra.Command{
	Use:   "heft",
	Short: "Access heft.io from the command line",
}
```

As a simple naming convention I prefer to rename the `version.go` file to `cmd_version.go` as well and get of course rid of all the unneeded lines inside the command file.

```go
package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Show heft.io client version",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(RootCmd.Use + " " + VERSION)
	},
}

func init() {
	RootCmd.AddCommand(versionCmd)
}
```

You may notice the custom variable `VERSION` which is not part of the default content Cobra created. The version will be configured in `main.go` and be updated with our build process using `goxc` later on. So add a global variable to `main.go` and pass it to the `cmd.Execute` function:

```go
package main

import "github.com/heft/cli/cmd"

var (
	// VERSION is set during build
	VERSION = "0.0.1"
)

func main() {
	cmd.Execute(VERSION)
}
```

The compiler will inform you that `cmd.Execute` is not expecting a parameter, so open `heft.go` (formerly `root.go`) and add the needed lines. First define a variable which will hold the version information:

```go
var (
	// VERSION is set during build
	VERSION string
)
```

After the variable is initialized update the `Execute` function to allow the code in `main.go` to pass the current version to our application.

```go
// Execute adds all child commands to the root command
func Execute(version string) {
	VERSION = version

	if err := RootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(-1)
	}
}
```

Now you are able to run the project again and call the version command. Cobra responds with the application name and version which is configured in `main.go`:

```go
$ > go run main.go version
heft 0.0.1
```

Nice! We have created a nifty little command line tool which is able to print its name and current version. Let's say our application is now kind of feature complete. It's time to compile a binary for the first time!

```bash
$ > go build
$ > ./cli version
heft 0.0.1
```

When using `go build` the binary file be named `cli` per default, this will change with the `goxc` configuration. To get started create a file called `.goxc.json` with the following content:

```json
{
  "AppName": "heft",
  "ConfigVersion": "0.9",
  "BuildSettings": {
    "LdFlags": "-s",
    "LdFlagsXVars": {
      "Version": "main.VERSION"
    }
  },
  "Tasks": [
    "interpolate-source",
    "default"
  ]
}
```

The configuration contains the application name `heft` and defines a list of tasks which should be called by `goxc` when building the binary.

For a first build it's totally fine to stick with the `default` task together with `interpolate-source` for setting the defined `VERSION` variable. After the configuration file is saved install `goxc` and give it try:

```bash
$ > go get -v github.com/laher/goxc
$ > $GOPATH/bin/goxc \
  -pv=0.0.1 \
  -build-ldflags "-X main.VERSION=0.0.1"
```

You will notice the fans of your machine speed up because `goxc` makes use of all the power your machine has to offer:

```bash
[goxc:xc] Parallelizing xc for 16 platforms, using max 7 of 8 processors
```

So let's stop this again and tell `goxc` to just compile one binary for now and configure a path where it should store the binary afterwars.

```bash
$ > $GOPATH/bin/goxc \
  -bc="darwin,amd64" \
  -pv=0.0.1 \
  -d=build \
  -build-ldflags "-X main.VERSION=0.0.1"
```

The `goxc` command has compiled the application for `darwin,amd64` only and stored all files inside the `build/` directory.

```bash
$ >  tree build
build
└── 0.0.1
    ├── LICENSE
    ├── downloads.md
    └── heft_0.0.1_darwin_amd64.zip
```

As we want to use the application after compiling it we can configure `goxc` to not archive the binary and to skip a couple of other tasks in order to speed up the local build process:

```json
{
  "AppName": "heft",
  "ConfigVersion": "0.9",
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
    "archive",
    "codesign",
    "copy-resources",
    "deb",
    "deb-dev",
    "downloads-page",
    "go-vet",
    "go-test",
    "go-install",
    "rmbin"
  ]
}
```

Together with the updated configuration `goxc` will now only create a binary file and skip all other unrelated tasks:

```bash
$ > $GOPATH/bin/goxc \
  -bc="darwin,amd64" \
  -pv=0.0.1 \
  -d=build \
  -build-ldflags "-X main.VERSION=0.0.1"
$ > tree build
build
└── 0.0.1
    └── darwin_amd64
        └── heft
```

Now there is a `heft` binary application which works fine on current `Mac OS X` machines and contains our Cobra application.

```bash
$ > ./build/0.0.1/darwin_amd64/heft version
heft v0.0.1
```

Of course you will forget about all the parameters you can pass to `goxc` and the handling of new versions is kind of messy. Thankfully we have `make` available! Move all commands into a neat `Makefile` with the following content:

```make
VERSION=0.0.1

clean:
	@rm -rf ./build

build: clean
	@$(GOPATH)/bin/goxc \
	  -bc="darwin,amd64" \
	  -pv=$(VERSION) \
	  -d=build \
	  -build-ldflags "-X main.VERSION=$(VERSION)"

version:
	@echo $(VERSION)
```

Run `make build` to have compile the binary file and use `make version` to display the current version. If you set the `VERSION` variable in your `Makefile` to `0.0.2` and run `make build` again you will get a new binary which responds with the increased version:

```bash
$ > make build
$ > ./build/0.0.2/darwin_amd64/heft version
heft v0.0.2
```

The next needed `make` command is `install` for copying the binary to it's final destination. The final `Makefile` now looks like this:

```make
VERSION=0.0.2
PATH_BUILD=build/
FILE_COMMAND=heft
FILE_ARCH=darwin_amd64

clean:
	@rm -rf ./build

build: clean
	@$(GOPATH)/bin/goxc \
	  -bc="darwin,amd64" \
	  -pv=$(VERSION) \
	  -d=$(PATH_BUILD) \
	  -build-ldflags "-X main.VERSION=$(VERSION)"

version:
	@echo $(VERSION)

install:
	install -d -m 755 '$(HOME)/bin/'
	install $(PATH_BUILD)$(VERSION)/$(FILE_ARCH)/$(FILE_COMMAND) '$(HOME)/bin/$(FILE_COMMAND)'
```

That's all! [Cobra](https://github.com/spf13/cobra) offers a great toolkit to get started with command line applications really fast and together with [`goxc`](https://github.com/laher/goxc) it's a solid setup for your next CLI application!

```bash
$ > make build
$ > make install
$ > ~/bin/heft version
heft v0.0.2
```

You can find the sources for the [`heft` application on GitHub](https://github.com/heft/cli). In an upcoming tutorial I will explain how to upload the binary to Amazon S3 and how to configure Homebrew for easy distribution.
