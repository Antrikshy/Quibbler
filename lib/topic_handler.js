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
    rule.hour = [0, 3, 6, 9, 12, 15, 18, 21];
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
        writeToJson(manualTopicsLocation, popTopic(0, manualTopics), function () {
            console.log("Popped topic from manual-topics.json")
        });

        return toReturn;
    }

    else {
        var autoTopics = JSON.parse(fs.readFileSync(topicsLocation));

        if (Object.keys(autoTopics).length == 0) {
            var errorTopic = {
                "topic": "Error fetching topic",
                "url": null
            };

            return errorTopic
        }

        else {
            var randTopicInd = getRandomInt(0, Object.keys(autoTopics).length - 1);
            var toReturn = autoTopics[randTopicInd];
            
            writeToJson(topicsLocation, popTopic(randTopicInd, autoTopics), function () {
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

function popTopic (index, topics) {
    delete topics[index.toString()];

    if (Object.keys(topics).length) {
        for (i = index; i < Object.keys(topics).length; i++) {
            topics[i] = topics[(i + 1).toString()];
        }
    }

    return topics;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
