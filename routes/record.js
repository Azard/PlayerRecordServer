var express = require('express');
var router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var url = 'mongodb://localhost:27017/PlayerRecord';

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/android', function(req, res, next) {
    console.log((new Date).toJSON() + "Receive POST /record/android: " + req.connection.remoteAddress);

    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        upsertRecord(db, req, function() {
            db.close();
        });
    });

    res.send("post received");

});

var upsertRecord = function(db, req, callback) {
    var updateTime = new Date;
    updateTime.setTime(req.body.updateTime);
    var record = [];
    var recordList = req.body.record.split("|");
    for(var index in recordList) {
        var recordItem = recordList[index];
        var recordItemDetail = recordItem.split(",");
        var musicName = recordItemDetail[0];
        var startTime = new Date;
        startTime.setTime(recordItemDetail[1]);
        var endTime = new Date;
        endTime.setTime(recordItemDetail[2]);
        record.push({
            musicName: musicName,
            startTime: startTime,
            endTime: endTime
        })
    }

    db.collection('record').updateOne(
        {_id: req.body.id},
        {
            id: req.body.id,
            os: req.body.os,
            wechat: req.body.wechat,
            dorm: req.body.dorm,
            house: req.body.house,
            updateTime: updateTime,
            record: record
        },
        {upsert:true, w: 1},
        function(err, result) {
            assert.equal(err, null);
            console.log((new Date).toJSON() + ": Upsert record: " + req.body.id);
            callback();
        });
};

module.exports = router;
