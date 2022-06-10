---
layout: default
title: app.js
parent: Project Structure & Walkthrough
--- 

# app.js
The app.js file is the server-side for your custom activity application - Think of it as the backend for your custom activity. Basically, it defines the endpoints for the activity, and how it responds when Marketing Cloud calls said endpoints. But, how does Marketing Cloud know the endpoints in your application to call? Recall in our [config.json](./config.json.md) file, in the ```configurationArguments``` property, we defined several endpoints: 

```js
    // config.json - configurationArguments property
    configurationArguments: {
        save: {
          url: `https://${req.headers.host}/save`
        },
        publish: {
          url: `https://${req.headers.host}/publish`
        },
        validate: {
          url: `https://${req.headers.host}/validate`
        },
        stop: {
          url: `https://${req.headers.host}/stop`
        }
    },
```

We also defined another endpoint in our ```arguments``` property: 
```js
    // config.json - arguments property
    arguments: {
        execute: {
            inArguments: [],
            outArguments: [],
            timeout: 90000,
            retryCount: 5,
            retryDelay: 1000,
            concurrentRequests: 5,
            url: `https://${req.headers.host}/execute`,
        }
    }
```

These endpoints are what Marketing Cloud will call when performing configuration and execution activities. The following is an explanation of the various endpoints and when Marketing Cloud will call them

| Name | Activity Type | Endpoint in Project | Get / Post | Description | 
|:-----|:--------------|:--------------------|:-----------|:------------|
| Execute | Execution | /execute | POST | Called whenever a Subscriber enters the activity. Therefore the code you want to execute when a contact enters your activity should be here |
| Save | Configuration | /save | POST | Called whenever you save the configuration for your custom activity. Marketing Cloud only expects a 200 response to know that your activity can be saved properly. | 
| Publish | Configuration | /publish | POST | Called when Journey has been published. This is when a journey is being activated and eligible for Contacts. Marketing Cloud only expects a 200 response to know that your activity can be published properly | 
| Validate | Configuration | /validate | POST | Called when Journey Builder wants you to validate the configuration to ensure the configuration is valid. Marketing Cloud only expects a 200 response to know that your activity is validated properly | 
| Stop | Configuration | /stop | POST | Called when a journey is stopped. Marketing cloud only expects a 200 response to know that your activity can be stopped | 

If you look in the project file - you might notice that all we're doing for these endpoints is a passing back a 200 response (besides the "/execute" endpoint), that's because that's all that Marketing Cloud requires! Technically, you can incorporate additional logic to run in these endpoints if you want. For example, let's say our form took a Data Extension name as a parameter, in the Validate endpoint, you can add logic to check Marketing Cloud to see if that Data Extension really exists or not. If the DE does not exist, you can return a 30X, 40X, or 50X response to signal to Marketing Cloud that the configuration is invalid and it will block the publishing phase. For this project, we handle all of our configuration validation in our src/index.js file, therefore we just let Marketing Cloud our activitiy's read to be published, saved, validated or stopped by responding with 200. 

## Code Walkthrough
Let's take a closer look at the code together to see what's going on in this file. The following is the app.js code in our project - As always, we'll be going through the code bit-by-bit, so if you would like to learn more, keep scrolling:

```javascript
const express     = require('express');
const bodyParser  = require('body-parser');
const path        = require('path');
const axios       = require('axios')

const app = express();
const configJSON = require('./config-json');

// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/index.html', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'))
})

// setup config.json route
app.get('/config.json', function(req, res) {
  // Journey Builder looks for config.json when the canvas loads.
  // We'll dynamically generate the config object with a function
  return res.status(200).json(configJSON(req));
});

/**
 * Called when a journey is saving the activity.
 * @return {[type]}     [description]
 * 200 - Return a 200 iff the configuraiton is valid.
 * 30x - Return if the configuration is invalid (this will block the publish phase)
 * 40x - Return if the configuration is invalid (this will block the publish phase)
 * 50x - Return if the configuration is invalid (this will block the publish phase)
 */
app.post('/save', function(req, res) {
  console.log('debug: /save');
  return res.status(200).json({});
});

/**
 * Called when a Journey has been published.
 * This is when a journey is being activiated and eligible for contacts
 * to be processed.
 * @return {[type]}     [description]
 * 200 - Return a 200 iff the configuraiton is valid.
 * 30x - Return if the configuration is invalid (this will block the publish phase)
 * 40x - Return if the configuration is invalid (this will block the publish phase)
 * 50x - Return if the configuration is invalid (this will block the publish phase)
 */
app.post('/publish', function(req, res) {
  console.log('debug: /publish');
  return res.status(200).json({});
});


/**
 * Called when Journey Builder wants you to validate the configuration
 * to ensure the configuration is valid.
 * @return {[type]}
 * 200 - Return a 200 iff the configuraiton is valid.
 * 30x - Return if the configuration is invalid (this will block the publish phase)
 * 40x - Return if the configuration is invalid (this will block the publish phase)
 * 50x - Return if the configuration is invalid (this will block the publish phase)
 */
app.post('/validate', function(req, res) {
  console.log('debug: /validate');
  return res.status(200).json({});
});

/**
 * Called when a Journey is stopped.
 * @return {[type]}
 */
app.post('/stop', function(req, res) {
  console.log('debug: /stop');
  return res.status(200).json({});
});


/**
 * Called when a contact is flowing through the Journey.
 * @return {[type]}
 * 200 - Processed OK
 * 3xx - Contact is ejected from the Journey.
 * 4xx - Contact is ejected from the Journey.
 * 5xx - Contact is ejected from the Journey.
 */
app.post('/execute', async (req, res) => {
  try {
  
    if (Object.keys(req.body.inArguments[0]).length > 0) {
      console.log('preparing payload...making request to url...')
      let reqOptions; 
      let contactKey = req.body.keyValue
      let urlString = req.body.inArguments[0].urlString
      let payload = req.body.inArguments[0].payload

      // add contactKey, eventDate to payload
      payload.contactKey = contactKey
            
      if (urlString && Object.keys(payload).length > 0) {
        reqOptions = {
          method: 'POST',
          url: urlString,
          data: JSON.stringify(payload)
        }
      } else {
        reqOptions = {
          method: 'POST',
          url: urlString,
        }
      }
          
      // not going to bother using 'await'...will slow down code waiting for response
      axios(reqOptions) 
      
    } else {
      return res.status(500).json({
        errorMessage: 'req.body.urlString did not exist'
      })
    }
    

    return res.status(200).json({})

  } catch(errorMessage) {

    return res.status(500).json({ errorMessage })
  }
})


app.listen(app.get('port'), () => {
  console.log(`Express is running at localhost: ${app.get('port')}`)
})
```

## Require Packages
In order to execute the code in our app.js file we'll need some packages to help us along the way. This file requires 4 packages; express, body-parser, path, and axios. Some of these may or may not sound familiar, but don't worry we cover each one below: 

- __Express__ - express is a popular web framework for javascript. We use it in our project to define endpoints and the resposnes we deliver for each endpoint. 
- __Body-parser__ - body-parser is a parsing middleware. In our project we use it to parse the json data that comes to our application so it's easily readable and workable. 
- __Path__ - path provides utilities for working with file and directory paths
- __Axios__ - axios is a promise based HTTP client for node.js and browser - It's primarily used for making http/API requests and returning responses. In our project, we're using it to make the API request to the endpoint we define in the custom activity's form. 

```javascript
const express     = require('express');
const bodyParser  = require('body-parser');
const path        = require('path');
const axios       = require('axios')

// Initializing express and config-json file 
const app = express();
const configJSON = require('./config-json');
```

## Configure Express Router
Before we begin using Express to define our endpoints, we just need to configure it so it runs properly. What we're doing below is defining the port we want to use, setting up express to parse json data and also configuring our application to use files from the ```dist``` directory. 

```javascript
// Configure Express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json()); 
app.use(express.static(path.join(__dirname, 'dist')))
```

## Display index.html and define Custom Activity's configuration
In order to display our custom activity's user interface, we need to serve the HTML file we'll display first. Below, the project serves the index.html file when the ```/``` or ```/index.html``` route is called. Below that, I set up the config.json route, which is called when Journey Builder canvas loads. 

```javascript
app.get('/', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/index.html', (req, res) => {
  return res.sendFile(path.join(__dirname, 'index.html'))
})

// setup config.json route
app.get('/config.json', function(req, res) {
  // Journey Builder looks for config.json when the canvas loads.
  // We'll dynamically generate the config object with a function
  return res.status(200).json(configJSON(req));
});
```

## Define the configuration routes
As mentioned above, the configuration routes are called by Marketing Cloud to the custom activity during configuration activities. For example, when Journey Builder saves the journey, it makes a call to the custom activity's ```/save``` endpoint. Again, Marketing Cloud knows the endpoint because of the config.json file that's loaded in the [Require Packages](#require-packages) section. 

Notice below that the general format for a route is as follows: 
```javascript
/**
* General Route Design
*/
app.post('/endpoint', function(req, res) {
    // run code...
    // then return 200 response
    return res.status(200).json({})
})
```

At minimum, Marketing Cloud requires a 200 response or else it will not block the action. See the comments in the code below for additional info on each route:

```javascript
/**
 * Called when a journey is saving the activity.
 * @return {[type]}     [description]
 * 200 - Return a 200 iff the configuraiton is valid.
 * 30x - Return if the configuration is invalid (this will block the publish phase)
 * 40x - Return if the configuration is invalid (this will block the publish phase)
 * 50x - Return if the configuration is invalid (this will block the publish phase)
 */
app.post('/save', function(req, res) {
  console.log('debug: /save');
  return res.status(200).json({});
});

/**
 * Called when a Journey has been published.
 * This is when a journey is being activiated and eligible for contacts
 * to be processed.
 * @return {[type]}     [description]
 * 200 - Return a 200 iff the configuraiton is valid.
 * 30x - Return if the configuration is invalid (this will block the publish phase)
 * 40x - Return if the configuration is invalid (this will block the publish phase)
 * 50x - Return if the configuration is invalid (this will block the publish phase)
 */
app.post('/publish', function(req, res) {
  console.log('debug: /publish');
  return res.status(200).json({});
});

/**
 * Called when Journey Builder wants you to validate the configuration
 * to ensure the configuration is valid.
 * @return {[type]}
 * 200 - Return a 200 iff the configuraiton is valid.
 * 30x - Return if the configuration is invalid (this will block the publish phase)
 * 40x - Return if the configuration is invalid (this will block the publish phase)
 * 50x - Return if the configuration is invalid (this will block the publish phase)
 */
app.post('/validate', function(req, res) {
  console.log('debug: /validate');
  return res.status(200).json({});
});

/**
 * Called when a Journey is stopped.
 * @return {[type]}
 */
app.post('/stop', function(req, res) {
  console.log('debug: /stop');
  return res.status(200).json({});
});
```

## Define the execution route
The execution route is the endpoint the Journey calls when a Subscriber enters the activity. It is where the magic happens! ✨ Marketing Cloud sends a request with payload containing metadata of the event. We can access this payload via ```req.body``` property. The most important properties from this metadata are the ```req.body.inArguments``` and ```req.body.keyValue```. The ```inArguments``` contains any static value (example: a datetime stamp) or value defined during the configuration of the activity (example: populated in the activity UI). ```keyValue``` is Contact Key of the Subscriber entering the activity. 

Below, is a sample of a payload request our custom activity receives from Marketing Cloud. Note that  ```inArguments.urlString``` and ```inArguments.payload``` 

```javascript
// REQ.BODY SAMPLE
{
  inArguments: [
    {
      urlString: 'www.sampleurlstring.com',
      payload: [Object]
    }
  ],
  outArguments: [],
  activityObjectID: '9841db2b-a598-4b3a-b1af-0dd71cd8939a',
  journeyId: 'b544882d-4160-4114-a419-7ff43e776b47',
  activityId: '9841db2b-a598-4b3a-b1af-0dd71cd8939a',
  definitionInstanceId: '4f60d95d-663e-468d-896a-d85c73a46f4a',
  activityInstanceId: '394345a0-38f5-4b1b-9223-a271e6046f7f',
  keyValue: 'contactKeyValue',
  mode: 0
}
```

Below is the full code in our project. In it we select the ```inArguments```, which is an array that contains the values the user populates when configuring the activity (i.e. ```urlString``` and ```payload```). We then make an API request to the ```urlString``` specified with an optional ```payload```.

```javascript
/**
 * Called when a contact is flowing through the Journey.
 * @return {[type]}
 * 200 - Processed OK
 * 3xx - Contact is ejected from the Journey.
 * 4xx - Contact is ejected from the Journey.
 * 5xx - Contact is ejected from the Journey.
 */
app.post('/execute', async (req, res) => {
  try {
  
    if (Object.keys(req.body.inArguments[0]).length > 0) {
      console.log('preparing payload...making request to url...')
      let reqOptions; 
      let contactKey = req.body.keyValue
      let urlString = req.body.inArguments[0].urlString
      let payload = req.body.inArguments[0].payload

      // add contactKey, eventDate to payload
      payload.contactKey = contactKey
            
      if (urlString && Object.keys(payload).length > 0) {
        reqOptions = {
          method: 'POST',
          url: urlString,
          data: JSON.stringify(payload)
        }
      } else {
        reqOptions = {
          method: 'POST',
          url: urlString,
        }
      }
            
      // not going to bother using 'await'...will slow down code waiting for response
      axios(reqOptions) 
      
    } else {
      return res.status(500).json({
        errorMessage: 'req.body.urlString did not exist'
      })
    }
    

    return res.status(200).json({
      // TODO: RETURN MESSAGE ACCORDING TO DOCUMENTATION
      // https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/transaction-key.html
    })

  } catch(errorMessage) {

    return res.status(500).json({ errorMessage })
  }
})
```