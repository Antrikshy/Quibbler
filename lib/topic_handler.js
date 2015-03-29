var fs = require('fs');
var schedule = require('node-schedule');
var trends = require('node-google-search-trends');

exports.firstTimeSetup = function () {
    fs.stat(manualTopicsLocation, function (err, stat) {
        if (err == null) {
            console.log("manual-topics.json exists");
        }

        else if (err.code == 'ENOENT') {
            writeToJson(manualTopicsLocation, {}, function () {
                console.log("manual-topics.json initiated");
            });
        }

        else {
            console.log("Error during first time setup of manual-topics.json")
        }
    });
}

exports.topicsScheduler = function (callback) {
    console.log("Starting topic scheduler");
    updateTopics(function () {
        console.log("Topics updated");
        callback();
    });

    var rule = new schedule.RecurrenceRule();
    rule.minute = 0;
    var j = schedule.scheduleJob(rule, function () {
        updateTopics(function () {
            console.log("Topics updated");
        });
    });
}

exports.getNextTopic = function () {
    var manualTopics = JSON.parse(fs.readFileSync(manualTopicsLocation));

    if (Object.keys(manualTopics).length > 0) {
        var toReturn = manualTopics["0"];
        writeToJson(manualTopicsLocation, popTopic(manualTopics), function () {
            console.log("Popped topic from manual-topics.json")
        });

        return toReturn;
    }

    else {
        var autoTopics = JSON.parse(fs.readFileSync(topicsLocation));

        if (Object.keys(autoTopics).length == 0) {
            var errorTopic = {
                "topic": "Error getting topic",
                "url": null
            };

            return errorTopic
        }

        else {
            var toReturn = autoTopics["0"];
            writeToJson(topicsLocation, popTopic(autoTopics), function () {
                console.log("Popped topic from topics.json")
            });

            return toReturn;
        }
    }
}

function updateTopics (callback) {
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

            writeToJson(topicsLocation, topics, callback);
        }
    });
}

function writeToJson (location, object, callback) {
    fs.writeFile(location, JSON.stringify(object, null, 2) , 'utf-8', function (err) {
        if (err) console.log("Error writing topics to file");
        else callback();
    });
}

function popTopic (topics) {
    delete topics["0"];

    if (Object.keys(topics).length) {
        for (i = 0; i < Object.keys(topics).length; i++) {
            topics[i] = topics[(i + 1).toString()];
        }
    }

    return topics;
}
