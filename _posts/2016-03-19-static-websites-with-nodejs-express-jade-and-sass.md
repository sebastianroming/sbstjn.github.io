---

layout: post
title: How to build static web sites with Express, SASS and Jade
published: true
date: 2016-06-21
permalink: /static-websites-with-nodejs-express-jade-and-sass.html

---

The release of a static website, no matter of which complexity, always comes with the question of how? Of course nobody likes to write plain **HTML** and **CSS**, or use a system without the possibility to include and re-use common lines of code.

I have always been a huge fan of [HAML](http://haml.info), but could not cotton up to the tooling of neither Ruby nor Rails. As a fan of JavaScript, it all boils down to use [Jade](http://jade-lang.com) for views and rendering.

If you go with Jade or *HAML* of course [SASS](http://sass-lang.com) is your friend for generating all your style sheets. There was a time some years ago when [Less](http://lesscss.org) was my tool of choice, but with all the third-party addons and mixins SASS offers way more flexibility and comfort than Less.

> I always prefer the SASS syntax over the SCSS syntax — who cares about semicolons and curly brackets?

As Jade is built with Node.js and an implementation of SASS seems to be available in nearly any given language, I choose [NPM](http://npmjs.com) for dependency management most days. The tooling for new packages or projects using NPM can be annoying, but thankfully you can use [npm init](https://docs.npmjs.com/cli/init) with the **-y** parameter to skip all questions and dive right into your project.

Of course all sources should be managed using **git**. As it’s just a static website and no magic oder hidden features are involved, there is not a single reason it cannot be hosted using a free and public repository at **GitHub**, like the website of [heft.io](https://github.com/heft/heft.io) is.

For most static sites or projects with NPM as the base tooling I prefer to store all my files inside a `src/` folder and build them into the `dist/` folder, which then is deployed to its destination.

Together with all the Jade, SASS and configuration files I mostly end up with the following structure:

```bash
├── package.json
├── script
│   └── serve.js
└── src
    ├── assets
    │   └── fonts
    │       ├── example.eot
    │       ├── example.svg
    │       ├── example.ttf
    │       └── example.woff
    ├── favicon.ico
    ├── styles
    │   └── main.sass
    └── views
        ├── index.jade
        ├── layouts
        │   └── default.jade
        └── partials
            └── style.jade
```

> Even for the smallest projects I make use of layouts, blocks and partials from Jade.

You may have noticed the `script/` folder, which — in this case — only has a file called `serve.js`, but may store more needed scripts for the project. Most static sites only require a simple Node.js script, which starts [Express](http://expressjs.com/) and renders all Jade and SASS files for local development. All other tasks for building the final CSS and HTML files are configured using NPM again, there is no need for Grunt, gulp or a Makefile when you can run all those tasks with NPM!

The `package.json` file has the configuration of all tasks, beginning with the setup of the needed folder structures and ending with purging the CloudFormation cache after deploying the static files to S3.

> NPM can handle all your tasks! Run, build and deploy your static files without the overhead of Grunt or gulp.

I try to split up most of my NPM tasks into smaller subtasks, which are triggered by their so-called parent. For the task to build the static site, I use a **build:sass** and **build:jade** task for example.

``` json
{
  "scripts": {
    "clean": "rm -rf ./dist",
    "setup": "npm run clean && mkdir -p ./dist",

    "build": "npm run build:sass && npm run build:jade",
    "build:jade": "jade src/index.jade -o dist",
    "build:sass": "node-sass src/styles/main.sass -o dist/styles",

    "deploy": "npm run setup && npm run build && npm run aws"
  }
]
```

After cleaning up previous builds with `npm run clean`, creating the needed folders *(npm run setup)* and building the static site *(npm run build)* all files are uploaded to a S3 bucket using a task as well. This may be followed by invalidating the cache at CloudFormation and after a short delay everything is live, at [heft.io](https://heft.io) for example …