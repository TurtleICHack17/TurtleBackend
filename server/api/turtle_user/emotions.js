'use strict';

var request = require('request');
var apiKey = "9c7eae7ef4904a39b35583d0f63445fa";

exports.callEmotionAPIPhoto = function(url) {
  request({
    "url" : "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize",
    "headers" : {
      "Content-Type" : "application/json",
      "Ocp-Apim-Subscription-Key" : "9c7eae7ef4904a39b35583d0f63445fa",
    },
    "method" : "POST",
    "json" : {
      "url" : "https://happyhealthcoachblog.files.wordpress.com/2013/11/smiling-woman.jpg",
    }
  }, function(err, res, body) {
    console.log(body);
  });
};

exports.callEmotionAPIVideoUpload = function(videoUrl, cb) {
  request({
    "url" : "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognizeinvideo?outputStyle=aggregate",
    "headers" : {
      "Content-Type" : "application/json",
      "Ocp-Apim-Subscription-Key" : apiKey,
    },
    "method" : "POST",
    "json" : {
      "url" : videoUrl,
    }
  }, function(err, res, body) {
    console.log(body);
    cb(body);
  });
};

exports.callEmotionAPIVideoCheckStatus = function(oid, cb) {
  request({
    "url" : "https://westus.api.cognitive.microsoft.com/emotion/v1.0/operations/"+oid,
    "headers" : {
      "Content-Type" : "application/json",
      "Ocp-Apim-Subscription-Key" : apiKey,
    },
    "method" : "GET"
  }, function(err, res, body) {
    console.log(body);
    cb(body);
  });
};

exports.calculateScore = function(video) {
  return 0;
};

exports.handleVideo = function(video) {

};
