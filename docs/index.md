## Marketing Cloud Custom Activity Walkthrough
Welcome to the Marketing Cloud Custom Activity Walkthrough! This site goes indepth with the code and journey builder workflows. So if you're not interested in this code in particular, but are still curious how Journey Builder works at a deep technical level, then keep reading on! 

## Config.json

### Routes
- */index.html* - called for iframing custom activity on to page
- */config.json* - called when Journey is being loaded on page. Journey Builder retrieves all custom activities while loading. The config.json file is expected to be returned 
- */stop* - Called when journey version is being stopped. Journey Builder expects a 200 response (success)  