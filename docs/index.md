---
layout: page
title: Intro
permalink: /
nav_order: 1
---

# Intro
Welcome to the Salesforce Marketing Cloud Custom Activity Walkthrough! 🎉  

> NOTE: Before we go any further, it's important to note that this is __not__ an officially supported Salesforce document and is based on trial & error, testing. If you would like to contribute, please open a pull request to this project with edits to the /docs folder

The purpose of this site is to walkthrough how to build a Custom Activity that sends `POST` API Requests in Salesforce Marketing Cloud so that you, the reader, can understand how to begin building your very own custom activities! The code reviewed for this tutorial is going to be a simple activity that sends a custom JSON payload to a URL for each Contact that enters the activity. This activity can be used to `POST` Contact data to an API endpoint or Custom Code hosted in Cloudpages. For example, if you wanted to send a Subscriber's information to another website when they enter the activity, you can configure the activity to make a ```POST``` request to that site along with the Subscriber's info.

Even if you're not interested in the nitty-gritty code, but are still curious how Journey Builder works at a deep technical level 🚧, then keep reading on! 📚   

## What is a Custom Activity?
A __Custom Activity__ is a [web application](https://en.wikipedia.org/wiki/Web_application) hosted on a remote server and iframed into the Journey Builder UI. The Journey Builder application and custom activity talk to eachother using a js framework called [postmonger](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html). For example, when the custom activity is updated and needs to tell JB to expect the updated activity, it triggers a message to JB using postmonger. We'll review this in more depth later on...













