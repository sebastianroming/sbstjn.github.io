---
layout: post
title: Boilerplate with TypeScript and CircleCI v2 Workflows for NPM packages
published: true
date: 2017-11-05
permalink: /boilerplate-for-typescript-npm-package-with-circleci-v2-workflows.html
description: >-
  Use TypeScript, CircleCI v2 Workflows, and GitHub Release to publish JavaScript packages on NPM. Test, Lint, and Build in parallel with CircleCI jobs and workflows.
image: >-
  /assets/images/posts/2017-11-05-npm-typescript-circleci-workflows/splash.png
github: https://github.com/sbstjn/typescript-npm-boilerplate
redirect_from:
  - /deploy-typescript-npm-with-circleci-workflows.html

---

If you love software workflows as much as I do, you should check out my basics for deploying NPM packages using TypeScript, CircleCI v2, and GitHub Releases.

You can find an [example project on GitHub](https://github.com/sbstjn/typescript-npm-boilerplate) configured with all of following features. Use this guide as documentation for the project and make sure to check out the sources!

## GitHub and The Basics

Just work with GitHub as you are used to: Work in branches, create Pull requests, ensure an always building `master` branch, and think about why [you might be using git wrong](https://dpc.pw/blog/2017/08/youre-using-git-wrong/). 

![GitHub PullRequest](/assets/images/posts/2017-11-05-npm-typescript-circleci-workflows/github-pr.png)

## CircleCI v2 Workflows

The recent major release *v2* of CircleCI introduced new features for *Jobs* and *Workflows*. You can split up the build process of your projects into smaller jobs that can be organized in workflows.

Each step for the NPM package is separated in single jobs, so tasks for running the tests and linting the source files can be run in parallel.

![CircleCI 2.0 Workflow](/assets/images/posts/2017-11-05-npm-typescript-circleci-workflows/workflow.png)

With the [basic GitHow flow](#github-and-the-basics), this works perfectly: Every commit on a branch and new Pull requests trigger the following NPM tasks:

* `lint` - *Check the sources*
* `test` - *Run all tests*
* `build` - *Ensure the project can be build*
* `coverage` - *Post coverage report to Coveralls.io*

Per default `lint` and `test` are executed at the same time in parallel. After both tasks finished successfully, CircleCI triggers the jobs for `build` and `coverage`, in parallel of course.

## Publish to NPM

On top of the basics for every branch and PullRequest, CircleCI is configured to run the `deploy` task for every *GitHub Release* after building the project was successful.

![GitHub Release](/assets/images/posts/2017-11-05-npm-typescript-circleci-workflows/github-release.png)

With this workflow, you will always have *tests, linting, and compile checks* for every branch and PR. You can manage your changelog with GitHub Releases and don't have to care about how to publish your project to NPM.

![GitHub Release Overview](/assets/images/posts/2017-11-05-npm-typescript-circleci-workflows/github-release-overview.png)

Just configure CircleCI with your NPM token, and for every release a new NPM package with that version is published:

![NPM Package](/assets/images/posts/2017-11-05-npm-typescript-circleci-workflows/npm.png)

You can find [all sources on GitHub](https://github.com/sbstjn/typescript-npm-boilerplate), of course. Just clone the repository and start writing your NPM modules using TypeScript and say goodbye to plain JavaScript 👋 😘
