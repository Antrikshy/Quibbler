var fs = require('fs');
var schedule = require('node-schedule');
var trends = require('node-google-search-trends');

exports.firstTimeSetup = function (callback) {
    writeToJson(topicsLocation, {});
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
            writeToJson(topicsLocation, trends);
        }
    });
}

function writeToJson (location, object) {
    fs.writeFileSync(location, JSON.stringify(object, null, 2) , 'utf-8');
}