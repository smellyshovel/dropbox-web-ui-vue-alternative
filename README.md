# Codename "dropbox-web-ui-vue-alternative"

A demo project implementing an alternative Dropbox web UI using Vue

## What is it?

It's just a demo project. Initially it was planned to be a front-end-only cloud UI. But I realized shortly that it's way more convenient to have some cloud back-end the data for the front-end could be fetched from. I decided not to reinvent the wheel and use instead some existing solution. So I picked Dropbox for this purpose. At least for now, for the time this thing is being developed.

## Future plans

Maybe, if the app reaches some public interest, the front-end would be detached from Dropbox (or even an abstraction for different cloud back-ends would be provided). But for now Dropbox and the app are tightly coupled together.

Moreover it's possible that the app will be launched as a (un)official alternative to the existing Dropbox's web UI.

## Want to participate?

Great, you are welcome. I'd be glad to work as the part of a team. However there's currently nothing I know for sure about this project. There ain't no any specific goals nor a roadmap. So anyone who's brave enough to take a ride on the train going I-don't-know-where is welcomed. Just open an issue for more details.

## Test it yourself

1. Clone the repo
1. Navigate to the project folder
1. Create a folder called `secret`
1. Create a file inside it called `DROPBOX_AUTH_TOKEN.txt`
1. Paste your Dropbox authentication token there
1. Run `npm i && npm run serve`
1. Open your browser and navigate to `localhost:8080/fm`

Open an issue and ask me for help if you have any questions.
