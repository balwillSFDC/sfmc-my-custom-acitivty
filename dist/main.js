/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../node_modules/postmonger/postmonger.js":
/*!************************************************!*\
  !*** ../node_modules/postmonger/postmonger.js ***!
  \************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
 * Postmonger.js   version 0.0.14
 * https://github.com/kevinparkerson/postmonger
 *
 * Copyright (c) 2012-2014 Kevin Parkerson
 * Available via the MIT or new BSD license.
 * Further details and documentation:
 * http://kevinparkerson.github.com/postmonger/
 *
 *///

(function (root, factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () { return factory(root); }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else {}
}(this, function (root) {
	root = root || window;

	var exports = exports || undefined;
	var Postmonger;
	var previous = root.Postmonger;
	var _window = (root.addEventListener || root.attachEvent) ? root : window;
	var Connection, Events, Session;

	//Set up Postmonger namespace, provide noConflict support, and version
	if (typeof(exports) !== 'undefined') {
		Postmonger = exports;
	} else {
		Postmonger = {};
	}
	Postmonger.noConflict = function () {
		root.Postmonger = previous;
		return this;
	};
	Postmonger.version = '0.0.14';

	//Create a new Postmonger Connection
	Connection = Postmonger.Connection = function (options) {
		options = (typeof(options) === 'object') ? options : {};

		var connect = options.connect || _window.parent;
		var from = options.from || '*';
		var to = options.to || '*';
		var self = this;

		//If string, grab based on id
		if (typeof(connect) === 'string') {
			connect = document.getElementById(connect);
		}

		//If no connection, check for jquery object
		if (connect && !connect.postMessage && connect.jquery) {
			connect = connect.get(0);
		}

		//If still no connection, check for iframe
		if (connect && !connect.postMessage && (connect.contentWindow || connect.contentDocument)) {
			connect = connect.contentWindow || connect.contentDocument;
		}

		//Throw warning if connection could not be made
		if (!(connect && connect.postMessage)) {
			if (_window.console && _window.console.warn) {
				_window.console.warn(' Warning: Postmonger could not establish connection with ', options.connect);
			}
			return false;
		}

		self.connect = connect;
		self.to = to;
		self.from = from;

		return self;
	};

	//Postmonger.Events - Hacked together from Backbone.Events and two Underscore functions.
	Events = Postmonger.Events = function () {
		var eventSplitter = /\s+/;
		var self = this;

		self._callbacks = {};

		self._has = function (obj, key) {
			return Object.prototype.hasOwnProperty.call(obj, key);
		};

		self._keys = function (obj) {
			if (Object.keys) {
				return Object.keys(obj);
			}

			if (typeof(obj)!=='object') {
				throw new TypeError('Invalid object');
			}

			var keys = [];

			for (var key in obj) {
				if (self._has(obj, key)) {
					keys[keys.length] = key;
				}
			}

			return keys;
		};

		self.on = function (events, callback, context) {
			var calls, event, node, tail, list;

			if (!callback) {
				return self;
			}

			events = events.split(eventSplitter);

			self._callbacks = self._callbacks || {};
			calls = self._callbacks;

			while (event = events.shift()) {
				list = calls[event];

				node = (list) ? list.tail : {};
				tail = {};

				node.next = tail;
				node.context = context;
				node.callback = callback;

				calls[event] = {
					tail: tail,
					next: (list) ? list.next : node
				};
			}

			return self;
		};

		self.off = function (events, callback, context) {
			var calls = self._callbacks;
			var event, node, tail, cb, ctx;

			if (!calls) {
				return;
			}

			if (!(events || callback || context)) {
				delete self._callbacks;
				return self;
			}

			events = (events) ? events.split(eventSplitter) : self._keys(calls);

			while (event = events.shift()) {
				node = calls[event];
				delete calls[event];
				if (!node || !(callback || context)) {
					continue;
				}

				tail = node.tail;
				while ((node = node.next) !== tail) {
					cb = node.callback;
					ctx = node.context;
					if (((callback && cb) !== callback) || ((context && ctx) !== context)) {
						self.on(event, cb, ctx);
					}
				}
			}

			return self;
		};

		self.trigger = function (events) {
			var event, node, calls, tail, args, all, rest;

			if (!(calls = self._callbacks)) {
				return self;
			}

			all = calls.all;
			events = events.split(eventSplitter);
			rest = Array.prototype.slice.call(arguments, 1);

			while (event = events.shift()) {
				if (node = calls[event]) {
					tail = node.tail;
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || self, rest);
					}
				}
				if (node = all) {
					tail = node.tail;
					args = [event].concat(rest);
					while ((node = node.next) !== tail) {
						node.callback.apply(node.context || self, args);
					}
				}
			}

			return self;
		};

		return self;
	};

	//Create a new Postmonger Session
	Session = Postmonger.Session = function () {
		var args = (arguments.length>0) ? Array.prototype.slice.call(arguments, 0) : [{}];
		var connections = [];
		var incoming = new Events();
		var outgoing = new Events();
		var self = this;
		var connection, i, j, l, ln, postMessageListener;

		//Session API hooks
		self.on = incoming.on;
		self.off = incoming.off;
		self.trigger = outgoing.trigger;
		self.end = function () {
			incoming.off();
			outgoing.off();
			if (_window.removeEventListener) {
				_window.removeEventListener('message', postMessageListener, false);
			} else if (_window.detachEvent) {
				_window.detachEvent('onmessage', postMessageListener);
			}
			return self;
		};

		//Establishing connections
		for (i=0, l=args.length; i<l; i++) {
			connection = new Connection(args[i]);
			if (connection) {
				for (j=0, ln=connections.length; j<ln; j++) {
					if (
						connections[j].connect === connection.connect &&
						connections[j].from === connection.from &&
						connections[j].to === connection.to
					) {
						connection = null;
						break;
					}
				}
				if (connection) {
					connections.push(connection);
				}
			}
		}

		//Listener for incoming messages
		postMessageListener = function(event){
			var conn = null;
			var message = [];
			var data;
			var k, len;

			//Attempt to find the connection we're dealing with
			for (k=0, len=connections.length; k<len; k++) {
				if (connections[k].connect === event.source) {
					conn = connections[k];
					break;
				}
			}

			//Check if we've found the connection
			if (!conn) {
				return false;
			}

			//Check if the message is from the expected origin
			if (conn.from !== '*' && conn.from !== event.origin) {
				return false;
			}

			//Check the data that's been passed
			try{
				data = JSON.parse(event.data);
				if(!data.e){
					return false;
				}
			}catch(e){
				return false;
			}

			//Format the passed in data
			message.push(data.e);
			delete data.e;
			for (k in data) {
				message.push(data[k]);
			}

			//Send the message
			incoming['trigger'].apply(root, message);
		};

		//Add the listener
		if (_window.addEventListener) {
			_window.addEventListener('message', postMessageListener, false);
		} else if(_window.attachEvent) {
			_window.attachEvent('onmessage', postMessageListener);
		} else{
			if (_window.console && _window.console.warn) {
				_window.console.warn('WARNING: Postmonger could not listen for messages on window %o', _window);
			}
			return false;
		}

		//Sending outgoing messages
		outgoing.on('all', function () {
			var args = Array.prototype.slice.call(arguments, 0);
			var message = {};
			var k, len;

			message.e = args[0];

			for (k=1, len=args.length; k<len; k++) {
				message['a' + k] = args[k];
			}

			for (k=0, len=connections.length; k<len; k++) {
				connections[k].connect.postMessage(JSON.stringify(message), connections[k].to);
			}
		});

		return self;
	};

	return Postmonger;
}));


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
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
const Postmonger = __webpack_require__(/*! postmonger */ "../node_modules/postmonger/postmonger.js")


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

  let urlString = inArguments.find((argument) => argument.urlString)

  if (urlString) {
    prePopulateInput(urlString)
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
})();

/******/ })()
;
//# sourceMappingURL=main.js.map