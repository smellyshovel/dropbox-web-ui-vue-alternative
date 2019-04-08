# Codename "dropbox-web-ui-vue-alternative" (v1-alfa)

Here's is the demo of what I've been able to come up with after working roughly the last **3 months** (mid Jan '19 - Apr 10 '19).

![](https://i.imgur.com/78vz0qk.gif)

*Scroll to the bottom of the README to learn how to test it yourself.*

## Purpose

The main purpose of this project is to present myself, my work and what I'm capable of to a potential employer. Yes, **I'm looking for a job** :)

## What is it?

This is a frontend-only (standalone) application for an imaginary cloud backend made with Vue. The current version of the app relies on Dropbox (because I decided not to reinvent the wheel creating "a brand new cloud service"), though the adapter is made with extensibility in mind, which means that everything *should* work nicely with any cloud backend (even a custom one) if you provide it an appropriate adapter ([/src/middleware/api.js](https://github.com/smellyshovel/dropbox-web-ui-vue-alternative/blob/devel/src/middleware/api.js)).

Sure thing some things will break during such a migration (at least I heavily believe so), but the universality foundation is laid in the application's architecture, and that is the main point.

*Refer to the [/src README](https://github.com/smellyshovel/dropbox-web-ui-vue-alternative/blob/devel/src/README) to learn more about the codebase itself and the decisions behind the application's architecture.*

## Current state

There're some bugs known (see [issues](https://github.com/smellyshovel/dropbox-web-ui-vue-alternative/issues)), but for the most part everything that I've managed to implement during these 3 months runs as smooth as possible.

## Future plans

There's a [huge list](https://github.com/smellyshovel/dropbox-web-ui-vue-alternative/projects/2) of the future plans, but I simply don't have enough time to make these all come true.

In the mean time I'm gonna switch to some other project because I personally believe that it's better to have 10 partially-finished-projects than 1 that runs perfectly (in terms of filling a portfolio).

## Want to participate?

Even despite all the above stated, the project is **not abandoned**. If you want to use it as a consumer - you are welcome. Want to work on it alongside with me and practice your team-work/javascript? Nice, you are welcome (but perhaps a bit later). Want to transform it to fit your needs and use it in your own project (or as a foundation for your own project)? It's MIT-licensed, so, you are welcome!

*Any purpose - one answer: contact me (g.smellyshovel@gmail.com) or open a new issue*

## How exactly you can help?

1. Fixing bugs (see the issues)
1. Implementing new features (see the list mentioned above)
1. Leaving the feedback
1. Giving me useful advices
1. Helping with the testing and automation
1. And, sure thing, simply by contributing to the codebase

## Test it yourself

1. Clone the repo
1. Run `npm i && npm run serve`
1. Open your browser and navigate to `localhost:8080`

Open an issue and ask me for help if you have any questions. Have a nice one ;)
