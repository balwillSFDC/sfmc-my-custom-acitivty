---
title: index.js
parent: src
grand_parent: Project Structure & Walkthrough
has_children: true
--- 

# index.js
The index.js file contains the code that allows the custom activity UI to interact with Marketing Cloud. It uses a package called postmonger to accomplish this. There are also other key functions which use Postmonger to interact with Marketing Cloud - We'll cover all the activities and functions in this file below: 
- [Setting up the file](#setting-up-the-file)
- [main()](#main)
- [onInitActivity()](#oninitactivitypayload)
- [onDoneButtonClick()](#ondonebuttonclick)
- [onFormEntry(e)](#onformentrye)
- [setupExampleTestHarness()](#setupexampletestharness)


## Setting up the file 
The file requires [Postmonger](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/using-postmonger.html) - Postmonger is a lightweight javascript utlity for cross-domain messaging. Marketing Cloud requires it in your Custom Activity so your Custom Activity can interact with Marketing Cloud and vice versa. 

To use Postmonger, a new Postmonger session must be instantiated.

Next, determine if the app is running on a local environment or not. This is stored as a true/false value in ```isDev``` variable. Next an ```activity``` object is created to store the activity's configuration details.

```javascript
// Custom activities load inside an iframe. We'll use postmonger to manage
// the cross-document messaging between journey builder and the activity
const Postmonger = require('postmonger')

// Creates a new connection for this session.
// We use this connection to talk to Journey Builder. You'll want to keep this
// reference handy and pass it into your UI framework if you're using React, Vue, etc.
const connection = new Postmonger.Session();

const isDev = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
// We'll store the activity on this variable when we receive it
let activity = {};
```

## main() 
```main()``` function handles  basic functionality for the form. The function is triggered as soon as journey builder is loaded, via ```document.addEventListener('DOMContentLoaded, ...)```. The ```main()``` function accomplishes the following: 
- [Set up app](#set-up-app)
- [Set up example SFMC payload for local development](#set-up-example-sfmc-payload-for-local-development)
- [Tell Marketing Cloud we're ready](#tell-marketing-cloud-were-ready)

The full code :
```javascript
// Wait for the document to load before we do anything
document.addEventListener('DOMContentLoaded', function main() {
  // setup our ui event handlers
  document.getElementById('url').addEventListener('keyup', onFormEntry)

  if (isDev) {
    console.log("DEV MODE ENABLED - TRIGGERING MOCK JB -> CUSTOM ACTIVITY SIGNAL")
    setupExampleTestHarness()
  }

  // Bind the initActivity event...
  // Journey Builder will respond with 'initActivity' after it receives the "ready" signal
  connection.on('initActivity', onInitActivity);
  connection.on('clickedNext', onDoneButtonClick)

  // We're all set! let's signal Journey Builder
  // that we're ready to receive the activity payload...
  // Tell the parent iFrame that we are ready.
  connection.trigger('ready');
  console.log('Journey Builder has been signaled we may receive payload...')
});
```


### Set up app
An event listener is first attached to the DOM so when the activity is loaded, it will trigger ```main()``` function. 

Once ```main()``` is triggered, it will attach an event listener to the url form field so when the field is populated, it will start ```onFormEntry``` function which basically lets Marketing Cloud know we updated the custom activity. 

```javascript
// Wait for the document to load before we do anything
document.addEventListener('DOMContentLoaded', function main() {
    // setup our ui event handlers
    document.getElementById('url').addEventListener('keyup', onFormEntry)
```

### Trigger setupExampleTestHarness() if local env
In the ```isDev``` variable above, a boolean value is returned based on whether we're testing in our local environment - This is done based on if the hostname is ```localhost``` or ```127.0.0.1```. If local environment, then a sample test payload is created as a global variable to simulate Marketing Cloud starting the activity. 
```javascript
 if (isDev) {
    console.log("DEV MODE ENABLED - TRIGGERING MOCK JB -> CUSTOM ACTIVITY SIGNAL")
    setupExampleTestHarness()
  }
```

### Tell Marketing Cloud we're ready
In the [Setting up the app](#setting-up-the-app) section, a Postmonger session was started. Using Postmonger, the activity can listen for certain messages from SFMC. 

The ```connection.on``` method is similar to an event listener in javascript in that it listens for a specific event to occur. In this case, the activity listens for journey builder to broadcast an ```initActivity``` message, meaning the activity has been dropped on the canvas. In response to the ```initActivivity``` message, the activity triggers the ```onInitActivity``` function, which receives the payload that SFMC sends along with the initActivity message. 

```javascript
  // Bind the initActivity event...
  // Journey Builder will respond with 'initActivity' after it receives the "ready" signal
  connection.on('initActivity', onInitActivity);
  connection.on('clickedNext', onDoneButtonClick)

  // We're all set! let's signal Journey Builder
  // that we're ready to receive the activity payload...
  // Tell the parent iFrame that we are ready.
  connection.trigger('ready');
  console.log('Journey Builder has been signaled we may receive payload...')
});
```

## onInitActivity(payload)
```onInitActivity``` triggers when Marketing Cloud sends the custom activity the ```initActivity``` message along with a json payload containing the configuration details of the custom activity. After receiving the json payload, the function does the following: 

- [Grab configuration values from SFMC payload](#grab-configuration-values-from-sfmc-payload)
- [Prepopulate form fields, as needed](#prepopulate-form-fields-as-needed)

```javascript
// this function is triggered by Journey Builder via Postmonger.
// Journey Builder will send us a copy of the activity here
function onInitActivity(payload) {
  // Set the activity object from this payload. We'll refer to this object as we
  // modify it before saving.
  activity = payload; 
  console.log(activity)

  let inArguments; 

  if (
    activity.arguments && 
    activity.arguments.execute && 
    activity.arguments.execute.inArguments &&
    activity.arguments.execute.inArguments.length > 0
  ) {
    inArguments = activity.arguments.execute.inArguments
  } else {
    inArguments = []
  }

  let urlStringObj = inArguments.find((obj) => obj.urlString)
  let payloadStringObj = inArguments.find((obj) => obj.payload)

  if (urlStringObj) {
    prePopulateInput('url', urlStringObj.urlString)
  }

  if (payloadStringObj) {
    prePopulateInput('payload', JSON.stringify(payloadStringObj.payload, null, 4))
  }

}
```

### Grab configuration values from SFMC payload
The ```onInitActivity(payload)``` function receives a json payload from marketing cloud with configuration details of the activity. The function defines the existing global variable ```activity``` with the ```payload``` variable provided by SFMC. The payload provided by Marketing Cloud will look something like this: 
```json
// SAMPLE PAYLOAD SENT BY MARKETING CLOUD -> CUSTOM ACTIVITY
{
    "name": "",
    "key": "EXAMPLE-1",
    "metaData": {},
    "configurationArguments": {},
    "arguments": {
        "executionMode": "{{Context.ExecutionMode}}",
        "definitionId": "{{Context.DefinitionId}}",
        "activityId": "{{Activity.Id}}",
        "contactKey": "{{Context.ContactKey}}",
        "execute": {
            "inArguments": [
                // If populated, will contain url and payload values as defined by end-user
            ],
            "outArguments": []
        },
        "startActivityKey": "{{Context.StartActivityKey}}",
        "definitionInstanceId": "{{Context.DefinitionInstanceId}}",
        "requestObjectId": "{{Context.RequestObjectId}}"
    }
}
```

Next, the ```inArguments``` variable is assigned a value from ```activity.arguments.execute.inArguments```. The ```inArguments``` variable contains the user-defined configuration variables for the custom activity. In this case, the user can define the url stirng and json payload (optional) that the custom activity makes a POST call with. Those values are found in ```inArguments``` array and set to their own variables; (1) ```urlStringObj``` and (2) ```payloadStringObj```

```javascript
  activity = payload; 
  console.log(activity)

  let inArguments; 

  if (
    activity.arguments && 
    activity.arguments.execute && 
    activity.arguments.execute.inArguments &&
    activity.arguments.execute.inArguments.length > 0
  ) {
    inArguments = activity.arguments.execute.inArguments
  } else {
    inArguments = []
  }

  let urlStringObj = inArguments.find((obj) => obj.urlString)
  let payloadStringObj = inArguments.find((obj) => obj.payload)
```

### Prepopulate form fields, as needed
After ```urlStringObj``` and ```payloadStringObj``` are defined, form is prepopulated with those values using the ```prePopulateInput``` function if there are any at all. If this is the first time the user is adding the custom activity to the canvas, there likely won't be any pre-existing values, because the end-user has never defined the custom activity in the context of this journey. However, if the user is clicking into the custom activity that has already been added to the canvas, then Marketing Cloud will pass those existing values through. 
```javascript
  if (urlStringObj) {
    prePopulateInput('url', urlStringObj.urlString)
  }

  if (payloadStringObj) {
    prePopulateInput('payload', JSON.stringify(payloadStringObj.payload, null, 4))
  }
```

## onDoneButtonClick() 
In the ```main()``` function, the ```onDoneButtonClick``` function was set to trigger when Marketing Cloud broadcasts the "clickedNext" message; ```connection.on('clickedNext', onDoneButtonClick)```. The "clickedNext" message is broadcasted either when the "next" button has been clicked, if there are other steps, or the "done" button has been clicked if there are no further steps. Since this activity has only 1 step to configure, the "clickedNext" message signifies that the user is done configuring. 

When triggered, this function achieves the following 
- [Validate that urlString and payload fields have been popualted](#validate-that-urlstring-and-payload-fields-have-been-popualted)
- [Assign urlString and payload values to activity variable](#assign-urlstring-and-payload-values-to-activity-variable)
- [Let SFMC know the activity has been updated](#let-sfmc-know-the-activity-has-been-updated)

```javascript
function onDoneButtonClick() {

  urlString = document.getElementById('url').value
  
  if (urlString.length > 0) {
    // we must set metaData.isConfigured in order to tell JB that this activity
    // is ready for activation
    activity.metaData.isConfigured = true; 

    payloadValue = document.getElementById('payload').value

    if (payloadValue) {
      try {
        payload = JSON.parse(payloadValue)
      } catch {
        document.getElementById('payload-field').classList.add('slds-has-error')
        document.getElementById('form-error-payload').style.display = null

      }
      
      activity.arguments.execute.inArguments = [ {urlString, payload } ]  
    } else {
      activity.arguments.execute.inArguments = [ {urlString} ] 
    }
    
    connection.trigger('updateActivity', activity)
    console.log(`Activity has been updated. Activity: ${JSON.stringify(activity)}`)

  } else {
    document.getElementById('url-field').classList.add('slds-has-error')
    document.getElementById('form-error-url').style.display = null
  }
}
```

### Assign urlString and payload fields to variables
The ```urlString``` is assigned the value in the url input, which is required in the form. The length of ```urlString``` is validated. The ```activity.metaData.isConfigured``` variable is set to true - This instructs journey builder that the activity is ready to be activated. 

Else, if ```urlString``` is not populated, then display error on the form. 

```javascript
function onDoneButtonClick() {

  urlString = document.getElementById('url').value
  
  if (urlString.length > 0) {
    // we must set metaData.isConfigured in order to tell JB that this activity
    // is ready for activation
    activity.metaData.isConfigured = true; 

    payloadValue = document.getElementById('payload').value
```

### If payload is defined, then validate it and add it to inArguments
If ```payloadValue``` is populated and it is valid JSON format, then it is parsed and assigned to the ```payload``` variable. If the parsing is unsuccessful, the error is shown in the form. If parsing is successful, ```urlString``` and ```payload``` are added to ```activity.arguments.execute.inArguments```. 

Else, if no payload, then only urlString is added to ```activity.arguments.execute.inArguments```. Once ```urlString``` and, if populated ```payload``` variables are assigned to inArguments, then the activity signals to SFMC that the activity has been updated and passes it the activity object via Postmonger - ```connection.trigger('updateActivity', activity)```

```javascript
    if (payloadValue) {
      try {
        payload = JSON.parse(payloadValue)
      } catch {
        document.getElementById('payload-field').classList.add('slds-has-error')
        document.getElementById('form-error-payload').style.display = null

      }
      
      activity.arguments.execute.inArguments = [ {urlString, payload } ]  
    } else {
      activity.arguments.execute.inArguments = [ {urlString} ] 
    }
    
    connection.trigger('updateActivity', activity)
    console.log(`Activity has been updated. Activity: ${JSON.stringify(activity)}`)

  } else {
    document.getElementById('url-field').classList.add('slds-has-error')
    document.getElementById('form-error-url').style.display = null
  }
}
```

## onFormEntry(e)
```onFormEntry``` lets marketing cloud know that a change has been made to the activity and has yet to be saved. This is done via ```connection.trigger('setActivityDirtyState', true);```
```javascript
function onFormEntry(e) {
  if (e.target.value.length > 0) {
    // let journey builder know the activity has changes
    connection.trigger('setActivityDirtyState', true);

  } 
}
```

## setupExampleTestHarness() 
```setupExampleTestHarness()``` is triggered only if testing in a local environment. It simulates the payload that Marketing Cloud passes to the custom activity. 

If testing in a local environment, you can type in ```jb.ready()``` in the console to trigger the payload. 


```javascript
function setupExampleTestHarness() {

  const jbSession = new Postmonger.Session();
  const jb = {};
  window.jb = jb;

  jbSession.on('setActivityDirtyState', function(value) {
      console.log('[echo] setActivityDirtyState -> ', value);
  });

  jbSession.on('requestInspectorClose', function() {
      console.log('[echo] requestInspectorClose');
  });

  jbSession.on('updateActivity', function(activity) {
      console.log('[echo] updateActivity -> ', JSON.stringify(activity, null, 4));
  });

  jbSession.on('ready', function() {
      console.log('[echo] ready');
      console.log('\tuse jb.ready() from the console to initialize your activity')
  });

  jb.save = () => {
    onDoneButtonClick()
  }

  // fire the ready signal with an example activity
  jb.ready = () => {
      jbSession.trigger('initActivity', {
        name: '',
        key: 'EXAMPLE-1',
        metaData: {},
        configurationArguments: {},
        arguments: {
            executionMode: "{{Context.ExecutionMode}}", 
            definitionId: "{{Context.DefinitionId}}",
            activityId: "{{Activity.Id}}",
            contactKey: "{{Context.ContactKey}}",
            execute: {
                inArguments: [
                  // SAMPLE
                  // {
                  //   payload: { foo: "bar"}
                  // }
                ],
                outArguments: []
            },
            startActivityKey: "{{Context.StartActivityKey}}",
            definitionInstanceId: "{{Context.DefinitionInstanceId}}",
            requestObjectId: "{{Context.RequestObjectId}}"
        }
      });
  };
}
```