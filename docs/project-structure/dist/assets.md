---
title: assets
parent: dist
grand_parent: Project Structure & Walkthrough
--- 

The assets folder contains the assets used by this project 🎨. We use the [Salesforce Lighting Design System](https://www.lightningdesignsystem.com/) - An official Salesforce library of customizable components.  

The ```index.html``` file pulls in these assets in the header: 
```html
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Custom Code Activity</title>
    <link rel="stylesheet" type="text/css" href="assets/styles/salesforce-lightning-design-system.css" >     
    <!--  ^^^ HERE ^^^ --> 
</head>
```

There are multiple ways to include the Salesforce Lightning Design System for your app to use - Just read the [Getting Started](https://www.lightningdesignsystem.com/getting-started/) page on their website. In this project, we're simply downloading the assets and uploading them to the assets folder.