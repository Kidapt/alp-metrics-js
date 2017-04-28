# ALP Metrics Script
The goal of this script is to allow for streamlined access the ALP metrics endpoint.

## Dependencies
* jQuery >= 3.0.0

## Setup
* include `alp-metrics.js` in your document. Since jQuery is required, you must include it after the jQuery script tag.
```html
<script type="text/javascript" src="path/to/alp_metrics.min.js"/>
```

## Usage

### Initialization
First you must configure the script to use your app's API key and landing url. These parameters should have been defined
in the OIDC setup.
```javascript
initAlpAuth(apiKey, landingUrl);
```

### Requesting Metrics
There are two forms to the metrics request function. In the first form, you provide a list of metric names to retrieve
and the start and end timestamps for the window you wish to retrieve these metrics for. This a convenience method for
cases where you wish to retrieve multiple metrics using the same start and end times.
```javascript
var providerLearnerId = '12345'; //This is the learner's ID in your system. The script will look up the appropriate ALP ID.
var metricNames = ['metric1', 'metric2']; //This is an array of metric names you wish to retrieve
var startTime = Date.now() - 2000000000; //The lower bound millisecond timestamp for metric you wish to retrieve
var endTime = Date.now(); //the upper bound millisecond timestamp for the metric you wish to retrieve
getAlpMetrics(providerLearnerId, metricNames, startTime, endTime).then(function(metrics) {
    //process your retrieved metrics here
    updateChart(metrics);
}, function(error) {
    //handle errors here
    console.log(error);
});
```

If you need to retrieve multiple metrics with different start and end times, you should use the second form:
```javascript
var providerLearnerId = '12345'; //This is the learner's ID in your system. The script will look up the appropriate ALP ID.
var metricObjects = [
    {
    	name: 'metric1',
    	start: 0,
    	end: 2000000000
	},{
    	name: 'metric2',
    	start: Date.now() - 2000000000,
    	end: Date.now()
    }
]; //array of metric specifiers
getAlpMetrics(providerLearnerId, metricObjects, startTime, endTime).then(function(metrics) {
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