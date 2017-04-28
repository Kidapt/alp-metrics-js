/**
 * Created by solomonliu on 2017-04-26.
 *
 * This script requires jQuery 3.0+ for the for Promises/A+ compliant Deferred objects
 */

(function() {
    var mApiKey = undefined;
    var mLandingUrl = undefined;

    //App constants
    var kAuthUrl = 'https://develop.kidaptive.com/v3/openid/user/web';
    var kLearnerUrl = 'https://develop.kidaptive.com/v3/learner';
    var kLogoutUrl = 'https://develop.kidaptive.com/v3/user/logout';
    var kMetricUrl = 'https://develop.kidaptive.com/v3/metric';

    var kStatusUnauthorized = 'Unauthorized';
    var kJsonContentType = 'application/json';
    var kLearnerError = 'No ALP learner found with provider ID ';
    var kJqueryVersionError = 'alp_metrics.js requires jQuery >= 3.0.0';
    var kInitError = "Call initAlpAuth to set ALP authentication parameters";

    //user state
    var auth = false;
    var learners = [];

    //helper function for checking jQuery version
    var checkJquery = function() {
        return $ && $().jquery && $().jquery >= '3.0.0';
    };

    //helper function to make sure that the OIDC parameters are defined
    var checkInit = function() {
        return mApiKey && mLandingUrl;
    };

    //helper function for getting a ALP learner from the local learner id
    var findLearner = function(providerLearnerId) {
        return learners.filter(function(learner) {
            return learner.providerId == providerLearnerId;
        })[0];
    };

    //helper function for getting (creating if necessary) the iframe to use for ALP authentication
    var getAuthFrame = function() {
        var authFrame = $('iframe#alp-auth')[0];
        if (!authFrame) {
            $('body').append(authFrame = $("<iframe id='alp-auth' src='about:blank' width='0' height='0' frameborder='0'/>")[0]);
        }
        return authFrame;
    };

    //helper function for turning an xhr into a promise
    var xhrPromise = function(xhr) {
        return xhr.then(function(data) {
            return data;
        }, function(xhr,status, error) {
            throw new Error(error);
        });
    };

    var getMetric = function(learnerId, metric, start, end) {
        return xhrPromise($.ajax(
            kMetricUrl,
            {
                method: 'POST',
                headers: {
                    'api-key': mApiKey
                },
                data: JSON.stringify({
                    learnerId: learnerId,
                    items: [{
                        name: metric,
                        start: start,
                        end: end
                    }]
                }),
                contentType: kJsonContentType,
                xhrFields: {
                    withCredentials: true
                }
            }
        ));
    };

    var doAuth = function() {
        var def = $.Deferred();

        var authFrame = getAuthFrame();

        $(authFrame).off('load').one('load', function() {
            authFrame.onload = undefined;
            if (authFrame.contentDocument && authFrame.contentDocument.URL == mLandingUrl) {
                def.resolve();
            } else {
                def.reject(new Error(kStatusUnauthorized));
            }
        });
        authFrame.src = kAuthUrl + '?api_key=' + encodeURIComponent(mApiKey) + '&redirect_uri=' + encodeURIComponent(mLandingUrl);

        return def.then(getLearners).then(function(data){
            auth = true;
            learners = data;
        }, function(error) {
            auth = false;
            learners = [];
            throw error;
        });
    };

    var getLearners = function() {
        return xhrPromise($.ajax(
            kLearnerUrl,
            {
                method: 'GET',
                headers: {
                    'api-key': mApiKey
                },
                xhrFields: {
                    withCredentials: true
                }
            }
        ));
    };

    window.initAlpAuth = function(apiKey, landingUrl) {
        mApiKey = apiKey;
        mLandingUrl = landingUrl;
    };

    window.getAlpMetrics = function(providerLearnerId, metric, start, end) {
        if (!checkJquery()) {
            return $.Deferred().reject(new Error(kJqueryVersionError));
        }
        if (!checkInit()) {
            return $.Deferred().reject(new Error(kInitError));
        }

        var def = $.Deferred();

        var learner = findLearner(providerLearnerId);

        if (!auth || !learner) {
            def.reject(new Error(kStatusUnauthorized)); //need to reauth/refresh learner list
        } else {
            getMetric(learner.id, metric, start, end).then(function(data) {
                def.resolve(data); //success!
            }).catch(function(error) {
                def.reject(error);
            });
        }


        return def.catch(function(error) {
            //retry if the problem was auth
            if (error.message == kStatusUnauthorized) {
                return doAuth().then(function () {
                    var learner = findLearner(providerLearnerId);
                    if (!learner) {
                        throw new Error(kLearnerError + providerLearnerId);
                    }
                    return getMetric(learner.id, metric, start, end);
                });
            } else {
                //otherwise, just propagate the error
                throw error;
            }
        });
    };

    window.doAlpLogout = function() {
        if (!checkJquery()) {
            return $.Deferred().reject(new Error(kJqueryVersionError));
        }
        if (!checkInit()) {
            return $.Deferred().reject(new Error(kInitError));
        }

        return xhrPromise($.ajax(
            kLogoutUrl,
            {
                method: 'POST',
                headers: {
                    'api-key': mApiKey
                },
                xhrFields: {
                    withCredentials: true
                }
            }
        )).always(function() {
            auth = false;
            learners = [];
        });
    };
})();