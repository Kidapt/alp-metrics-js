# ALP Metrics Script
The goal of this script is to allow for streamlined access the ALP metrics endpoint.

## Dependencies
* jQuery >= 3.0.0

## Setup
* include `alp-metrics.js` in your document. Since jQuery is required, you must include it after the jQuery.
```html
<script type="text/javascript" src="path/to/alp_metrics.js"/>
```

## Usage

### Initialization
First you must configure the script to use your app's API key and landing url.
```javascript
var apiKey;
var landingUrl;
initAlpAuth(apiKey, landingUrl);
```

### Requesting Metrics
```javascript
var providerLearnerId; //This is the learner's ID in your system. The script will look up the appropriate ALP ID.
var metricName; //This is the name of the metric you wish to retrieve
var startTime; //The lower bound millisecond timestamp for metric you wish to retrieve
var endTime; //the upper bound millisecond timestamp for the metric you wish to retrieve
getAlpMetrics(providerLearnerId, metricName, startTime, endTime).then(function(metrics) {
    //process your retrieved metrics here
    updateChart(metrics);
}, function(error) {
    //handle errors here
    console.log(error);
});
```
The `getAlpMetrics` function returns a jQuery Promise object, which can be used to handle responses asynchronously.
See https://api.jquery.com/Types/#Promise and https://api.jquery.com/category/deferred-object for more details about
jQuery Promise and Deferred objects
For information about the Promise/A+ standard, see https://promisesaplus.com.

### Logging out
It is often a good idea to log out of ALP when the user logs out of your app. This function also returns a Promise.
```javascript
doAlpLogout().then(function() {
    //tasks to do after 
}, function(error) {
    //handle errors here
    console.log(error);
});
```