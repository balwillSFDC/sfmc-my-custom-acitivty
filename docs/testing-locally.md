---
layout: default
title: Testing Locally
nav_order: 3
---

# Testing Locally
*The following assumes you have git installed and it is your first time testing the project. App is launched on [http://localhost:3000/](http://localhost:3000/)*
```
git clone https://github.com/balwillSFDC/sfmc-my-custom-acitivty
npm install
npm start
```

When testing locally, you are not able to interact with journey builder as you would if the app was iframed into the platform. For example, when you run locally, you'll notice there's no "Save" or "Cancel" button like you would expect in the platform, this is because those buttons are part of Journey Builder's UI and not the custom activity's - the two interact with each other using postmonger (ex. if you press "cancel" a message is triggered from JB -> custom activity to close the acivity). 

In any case, a "mock" jb object ```jb``` is setup in the code so if you run locally, you can open the browser console and run ```jb.ready()```. This will instantiate the jb object. After doing so, if you populate the fields, you can run ```jb.save()``` and you'll see what the save payload looks like.

When making updates to the ```src/index.js``` file, be sure to run ```npm run build``` to compile the file
