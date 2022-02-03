// ****************
// *
// * 
// [activityName].js
// *
// CONTAINS POSTMONGER EVENTS AND SITS IN BETWEEN YOUR CONFIGURATION APP IN THE iFRAME AND JOURNEY BUILDER
// *
// *
// ****************

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

// Wait for the document to load before we do anything
document.addEventListener('DOMContentLoaded', function main() {
  // setup our ui event handlers
  setupEventHandlers();
  console.log('Event handlers have been set...')

  if (isDev) {
    console.log("DEV MODE ENABLED - TRIGGERING MOCK JB -> CUSTOM ACTIVITY SIGNAL")
    setupExampleTestHarness()
  }


  // Bind the initActivity event...
  // Journey Builder will respond with 'initActivity' after it receives the "ready" signal
  let initActivityResults = connection.on('initActivity', onInitActivity);
  console.log('Triggered onInityActivity()...')
  console.log(`initActivityResults: ${JSON.stringify((initActivityResults))}`)

  // We're all set! let's signal Journey Builder
  // that we're ready to receive the activity payload...
  // Tell the parent iFrame that we are ready.
  connection.trigger('ready');
  console.log('Journey Builder has been signaled we may receive payload...')
});

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

  if (urlStringObj) {
    prePopulateInput(urlStringObj.urlString)
  }

}

function prePopulateInput(inputValue) {
  let inputField = document.getElementById('input')
  inputField.value = inputValue
}

function onDoneButtonClick() {
  // we must set metaData.isConfigured in order to tell JB that this activity
  // is ready for activation
  activity.metaData.isConfigured = true; 

  urlString = document.getElementById('input').value

  activity.arguments.execute.inArguments = [ { urlString } ];

  connection.trigger('updateActivity', activity)

  console.log(`Activity has been updated. Activity: ${JSON.stringify(activity)}`)
}

function onCancelButtonClick() {
  // tell Journey Builder that this activity has no changes.
  // we won't be prompted to save changes when the inspector closes
  connection.trigger('setActivityDirtyState', false);

  // now request that Journey Builder closes the inspector/drawer
  connection.trigger('requestInspectorClose');
}

// HANDLER TO DISABLE "DONE" BUTTON - SAMPLE BELOW
function onFormEntry(e) {
  if (e.target.value.length > 0) {
    document.getElementById('done').removeAttribute('disabled')

    // let journey builder know the activity has changes
    connection.trigger('setActivityDirtyState', true);

  } else {
    document.getElementById('done').setAttribute('disabled', '')
  }
}

function setupEventHandlers() {
  // Listen to events on the form
  document.getElementById('done').addEventListener('click', onDoneButtonClick); 
  document.getElementById('cancel').addEventListener('click', onCancelButtonClick)
  document.getElementById('input').addEventListener('keyup', onFormEntry)
}


// this function is for example purposes only. it sets ups a Postmonger
// session that emulates how Journey Builder works. You can call jb.ready()
// from the console to kick off the initActivity event with a mock activity object
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

  // fire the ready signal with an example activity
  jb.ready = function() {
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
                  inArguments: [],
                  outArguments: []
              },
              startActivityKey: "{{Context.StartActivityKey}}",
              definitionInstanceId: "{{Context.DefinitionInstanceId}}",
              requestObjectId: "{{Context.RequestObjectId}}"
          }
      });
  };
}