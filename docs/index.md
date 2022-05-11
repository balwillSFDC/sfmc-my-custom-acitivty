---
layout: page
title: Intro
permalink: /
---

## Intro
Welcome to the Marketing Cloud Custom Activity Tutorial! 🎉 

> NOTE: Before we go any further, it's important to note that this is __not__ an officially supported Salesforce document and is based on trial & error, testing. If you would like to contribute, please open a pull request to this project with edits to the /docs folder

The purpose of this site is to walkthrough how to build a Custom Activity that send `POST` API Requests in Salesforce Marketing Cloud so that you, the reader, can understand how to begin building your very own custom activities! The code reviewed for this tutorial is going to be a simple activity that sends a custom JSON payload to a URL for each Contact that enters the activity. This activity can be used to `POST` Contact data to an API endpoint or Custom Code hosted in Cloudpages. Even if you're not interested in the nitty-gritty code, but are still curious how Journey Builder works at a deep technical level 🚧, then keep reading on! 📚   

## What is a Custom Activity?
A __Custom Activity__ is a [web application](https://en.wikipedia.org/wiki/Web_application) hosted on a remote server and iframed into the Journey Builder UI. The Journey Builder application and custom activity talk to eachother using a js framework called [postmonger](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html). For example, when the custom activity is updated and needs to tell JB to expect the updated activity, it triggers a message to JB using postmonger. We'll review this in more depth later on...


## Testing Locally
*The following assumes you have git installed and it is your first time testing the project. App is launched on [http://localhost:3000/](http://localhost:3000/)*
```
git clone https://github.com/balwillSFDC/sfmc-my-custom-acitivty
npm install
npm start
```

When testing locally, you are not able to interact with journey builder as you would if the app was iframed into the platform. For example, when you run locally, you'll notice there's no "Save" or "Cancel" button like you would expect in the platform, this is because this is Journey Builder's UI and not the custom activity's - the two interact with each other using postmonger (ex. if you press "cancel" a message is triggered from JB -> custom activity to close the acivity). 

In any case, a "mock" jb object ```jb``` is setup in the code so if you run locally, you can open the browser console and run ```jb.ready()```. This will instantiate the jb object. After doing so, if you populate the fields, you can run ```jb.save()``` and you'll see what the save payload looks like.











