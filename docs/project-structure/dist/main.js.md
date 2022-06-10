---
title: main.js
parent: dist
grand_parent: Project Structure & Walkthrough
--- 

# main.js
Taking a look at the main.js file, it contains our code in the ```src/index.js``` file (if you scroll towards the bottom). That's because the main.js file is the compiled version of the ```index.js``` file! 

## What is Babel and why does this project use it?
The code was compiled using [babelrc](https://babeljs.io/docs/en/). If you're unfamiliar with babelrc, it's a javascript compiler that makes javascript code backwards compatible with current and older browsers. This project uses it so our index.html file is able to use the code in ```src/index.js```, which contains many of the postmonger activities. For example, the ```src/index.js``` file handles updating the configuration of the custom activity.

