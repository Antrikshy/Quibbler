var fs = require('fs');
var schedule = require('node-schedule');
var trends = require('node-google-search-trends');

exports.firstTimeSetup = function (callback) {
    writeToJson(topicsLocation, {});
    writeToJson(manualTopicsLocation, {});
    callback();
}

exports.topicsScheduler = function () {
    console.log("Starting topic scheduler");
    getTopics();

    var rule = new schedule.RecurrenceRule();
    rule.minute = 0;
    var j = schedule.scheduleJob(rule, function () {
        getTopics();    
    });
}

function getTopics () {
    trends("United States", 20, function(err, trends) {
        if (err) console.log("Error getting trends");
        else {
            var topics = {};

            for (i = 0; i < Object.keys(trends).length; i++) {
                var curr = {};

                curr["title"] = trends[i].title[0];
                curr["url"] = trends[i]["ht:news_item"][0]["ht:news_item_url"][0];

                topics[i] = curr;
            }

            writeToJson(topicsLocation, topics);
        }
    });
}

function writeToJson (location, object) {
    fs.writeFileSync(location, JSON.stringify(object, null, 2) , 'utf-8');
}