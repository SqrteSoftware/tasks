# Sqrte Tasks

## Task Management Reimagined

See the [Brochure Site](https://tasks.sqrte.com/info/) for more info.

Sqrte Tasks allows you to view all of your todo lists together in one dashboard view, allowing you to easily multi-task between them.

It aims to blend the simplicity of paper with the efficieny of a text editor.

Some of the core values of this project include:
- Simplicity
- Efficiency
- Privacy
- Local First
- Offline First
- Open Source

## Run the App

Change into the root of the repo and execute the following.
Running these the first time will take some time.
```
docker build --target develop -t tasks-app .
docker run -it -p 3000:3000 -v ${PWD}:/tasks/app tasks-app
```
Open the app at localhost:3000 in your browser.
## Contributing

To help make sure time is not wasted and a contribution is accepted, please follow these steps:

1) Before coding anything, create a quick Sqrte Tasks Enhancement Proposal (STEP) via a github issue.
    - Describe what you would like to do
    - Describe a rough design
    - Keep it short and simple. Details can be sorted out via conversation as needed.
2) Once the STEP is agreed upon, go ahead and implement the changes in your fork.
3) Create a Pull Request to be reviewed.

You can, of course, create a PR first thing if you prefer, but it may not be accepted. These steps are to help make sure everyone is in agreement with a change and will hopefully save time for everyone by preventing surprises.

