// ****************
// *
// * 
// app.js (AKA config.JSON)
// *
// SERVER SIDE IMPLEMENTATION
// *
// *
// ****************

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

// app.post('/login', routes.login );
// app.post('/logout', routes.logout );

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
  
    console.log(req.body)
    let inArguments = req.body.inArguments[0]

    if (Object.keys(inArguments).length > 0) {
    
      let reqOptions; 

      if (inArguments.payload) {
        reqOptions = {
          method: 'POST',
          url: inArguments.urlString,
          data: JSON.stringify(inArguments.payload)
        }
      } else {
        reqOptions = {
          method: 'POST',
          url: inArguments.urlString,
        }
      }
      
      const response = await axios(reqOptions)

      console.log('response from url post: ')
      console.log(`response.status: ${response.status}`)

    } else {
      return res.status(500).json({
        error: 'error: req.body.urlString did not exist'
      })
    }
    

    return res.status(200).json({
      result: 'good news, the post message was sent!'
    })

  } catch(e) {
    let inArguments = req.body.arguments.execute.inArguments[0]

    if (inArguments.urlString) {
      const response = await axios({
        method: 'POST',
        url: inArguments.urlString,
        data: e
      })
    }
    return res.status(500).json({
      error: 'Something went wrong...',
      message: e
    })
  }
})




app.listen(app.get('port'), () => {
  console.log(`Express is running at localhost: ${app.get('port')}`)
})