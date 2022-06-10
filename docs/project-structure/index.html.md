---
layout: default
title: index.html
parent: Project Structure & Walkthrough
--- 

# index.html
This is the html code for the custom activity - It's what's displayed to the User when they add the Custom Activity to their Journey's canvas. Below is the index.html for this project - It's a simple form built using the [Salesforce Lightning Design System](https://www.lightningdesignsystem.com/) with 3 form inputs. 

Of course, you can get more creative than this and may build a custom activity with multiple html files (i.e. in the case of an activity with multiple steps). That's outside the scope of this walkthrough, which is why we'll use a simple form. 

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>Custom Code Activity</title>
    <link rel="stylesheet" type="text/css" href="assets/styles/salesforce-lightning-design-system.css" >

</head>
<body>
  <img style="top: 0; background-color: #666;" src="assets/images/themes/oneSalesforce/banner-group-unlisted-default.png" />
<div class="slds-form slds-m-around--medium">
  <h2 class="slds-page-header__title slds-truncate">API Request</h1>

    <div class="slds-form-element slds-m-bottom_small" id='url-field'>
        <label class="slds-form-element__label" for="url"><abbr class="slds-required" title="required">* </abbr>URL String</label>
        <div class="slds-form-element__control">
          <input type="text" id="url" placeholder="Enter your url here..." class="slds-input" /> 
        </div>
        <div class="slds-form-element__help" id="form-error-url" style="display: none;" >Enter a url to make a request to</div>
    </div>
    <div class="slds-form-element slds-form-element_stacked" id='payload-field'>
      <label class="slds-form-element__label" for="payload"> Payload</label>
      <div class="slds-form-element__control">
        <textarea style="height: 400px;" id="payload" placeholder='{ &#10;   "foo":"bar"  &#10;}' class="slds-textarea"></textarea>
      </div>
      <div class="slds-form-element__help" id="form-error-payload" style="display: none;" >Payload does not follow correct JSON syntax</div>
    </div>
</div>
<div id="discount-code-output" class="slds-text-heading_small"></div>
<script type="text/javascript" src="main.js"></script>
</body>
</html>
```