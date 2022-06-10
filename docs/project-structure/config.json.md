---
layout: default
title: config.json
parent: Project Structure & Walkthrough
--- 

# Config.json
Next, we'll begin with the Config.json file for the project (found [here](https://github.com/balwillSFDC/sfmc-my-custom-acitivty/blob/main/config-json.js)), which contains the metadata for your activity. It calls Journey Builder calls initially before loading in your activity and tells JB the following: 
- [API Version & Metadata](#api-version--metadata)*
- [Activity Type](#activity-type)*
- [Language](#language)*
- [Execution Arguments](#execution-arguments)*
- [Configuration Arguments](#configuration-arguments)*
- [User Interface](#user-interface) (used for legacy config, still optional)
- [Payload Schema](#payload-schema)

_* Required_ 

__NOTE__: This project's config.json file is actually a js file where we export data as json. So if you're wondering why the code doesn't exactly match json format or why the projects file is config-json.js, that's why!

Below is the outline for the Config.json file - Let's take a closer look at each of these properties 🔎 and begin to fill in the values as they are in the project: 

```js
{
    workflowApiVersion: "1.1",
    metaData: {
      icon: "",
      category: ""
    },
    type: "",
    lang: {
      en-US: {
        name: "",
        description: ""
      }
    },
    arguments: {
      execute: {
        inArguments: [],
        outArguments: [],
        timeout: 90000,
        retryCount: 5,
        retryDelay: 1000,
        concurrentRequests: 5,
        url: `https://${req.headers.host}/execute`,
      },
    },
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
    schema: {
      arguments: {
        execute: {
          inArguments: [],
          outArguments: []
        }
      }
    }
}
```

## API Version & Metadata
```js
    workflowApiVersion: "1.1",
    metaData: {
      icon: "images/apex_120.png",
      category: "custom"
    },
```

* The `workflowApiVersion` is the property that tells Journey Builder which version this custom activity uses. You should use the latest version possible which is currently `1.1` other accepted values are `1.0` and `0.5`
* The `metaData` property contains UI-only values that help you identiy and catagorize the activity. 
    * `icon` (required) is a string that represent the path for icon
    * `category` (required) string represents what section the custom activity is organized under
    * `expressionBuilderPrefix` (optional) Use this field to assign custom activities a pre-determined string prefix in the expression builder for decision split. Defaults to Custom Activity if not provided. Pass this field in through the config.json file or include it in the custom activity payload.
    * `isConfigured` (optional) If true, the activity is marked as configured when dropped on the canvas
    * `configurationDisabled` (optional) If true, and `isConfigured` is true, then the activity configuration button is disabled
    * `configOnDrop` (optional) If true, the activity configuration opens when the activity is dropped on the canvas



## Activity Type
```json
    "type": "REST",
``` 

This is a string property that represents the type of activity. Most of the time this should be set to `REST`. Other valid value types include: 
* MultiCriteriaDecision
* DataExtensionUpdate
* EMAILV2
* EngagementDecision
* randomSplit
* Wait
* Rest


## Language
```json
    lang: {
      "en-US": {
        name: "Custom Code Activity",
        description: "Makes a POST call with payload to a specific URL"
      }
    },
```

Used to define the display name and description that appears for the Custom Activity. If you want to internationalize your activity (i.e. display the name in spanish when accessed by a spanish locale) then you would add use two-letter ISO 639-1 standard. So en-US for American english, pt-BR for Potuguese Brazilian. 
 
## Execution Arguments 
```js
    arguments: {
      execute: {
        inArguments: [],
        outArguments: [],
        timeout: 90000,
        retryCount: 5,
        retryDelay: 1000,
        concurrentRequests: 5,
        url: `https://${req.headers.host}/execute`,
      },
    },
```
__NOTE__: If you want to pass Contact data or data from a Data Extension in the ```inArguments``` or ```outArguments``` you can use [Data Binding](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/how-data-binding-works.html). For example, if you wanted to access a value from the Contact model, you can do ```Contact.Attribute.valueFromDataModel``` keep in mind if there are multiple levels of relationships to the Contact Key you will have to define those like so  ```Contact.Attribute.relationship1.relationship2.valueFromDataModel```.  

## Configuration Arguments
These are the routes you're telling Journey builder to use for your activity.
- */index.html* - called for iframing custom activity on to page
- */config.json* - called when Journey is being loaded on page. Journey Builder retrieves all custom activities while loading. The config.json file is expected to be returned 
- */stop* - Called when journey version is being stopped. Journey Builder expects a 200 response (success)  

```js
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

## User Interface
Taking a look at this projects [config.json](../../config-json.js) file, you may notice that the `userInterface` property is commented out. The reason for this is that the user interface defaults to the most up-to-date version. There is no in-depth documentation regarding how this property can be used so it is instead ignored 

```javascript
    // userInterfaces: {
    //   configModal: {
    //     fullscreen: false
    //   }
    // },
```

## Payload Schema
The ```schema``` property should mirror the activity configuration from the top level of the config.json file and specifies schema infromation about in and out arguments. Schema objects follow this pattern: 

```json
{
    "dataType": MC data type,
    "isNullable": Boolean,
    "direction": "in" or "out",
    "access": "visible" or "hidden"
}
```

The context of the call implies the direction of the arguments in the schema, making this value optional. Any provided value must match the context. You can’t include a null value for any declared outArguments, as the call requires these values. Therefore, assume isNullable to be false. For all access property parameters not set to visible, subsequent expression builders don’t show this out argument.

```javascript
  schema: {
    arguments: {
      execute: {
        inArguments: [
          { 
            'parameterName': {
                "dataType": MC data type,
                "isNullable": Boolean,
                "direction": "in" or "out",
                "access": "visible" or "hidden"
            }
            
          }
        ],
        outArguments: []
      }
    }
  }
```