---

layout: post
title: In Software, you don't plan for the Happy Path
published: true
date: 2017-01-10
permalink: /you-dont-plan-for-the-happy-path.html
image: /assets/images/posts/2017-01-10-you-dont-plan-for-the-happy-path/splash.jpg

---

It's a recurring task in software development to forecast the amount of time something will take. There are Roadmap Meetings, Sprint Planning Meetings or even the spontaneous estimates you must provide in the hallway. All of them require you to pull out your divining rod and predict the future.

Imagine you are asked how long it will take to create an applicatio which responds with the word `four` whenever somebody enters the number `4` . it is dead simple, it will take about four seconds:

```
#!/bin/bash

echo "four"
```

There you go, a simple application that will always respond with the word `four` when you pass `4` as a parameter.

But it is pretty obvious there is more we need to take care of. What if somebody passed `5` as parameter? Should the application respond with `four` as well? I think you can guess the answer: No.

## Conclusion

The reason why estimates on software projects are so complicated is, they are the opposite of your normal planning habits. As a human being we tend to plan for the happy path. That's why we assume everything will be fine, start to gamble or do only have the basic insurances for our health and housing.

But there are obstacles which will cross your happy path. To plan project timings always comes down to forecast possible obstacles on your way to the end zone and how this delay will affect your happy path.

Take Scrum for example: During the Sprint Planning Meeting the team commits itself to the tasks for an iteration of most often two weeks. The length of two weeks is not chosen randomly nor because `2` is a beautiful number. It is because two weeks are enough time to start, finish, and deploy something and it's a time window you feel comfortable to predict possible obstacles within. *What could possibly go wrong*, right?

The longer your iterations are, the more can go wrong. The more can go wrong and the less accurate your predictions will be.
