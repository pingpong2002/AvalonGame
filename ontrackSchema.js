var mongoose = require('mongoose');

var model = mongoose.model('ontrack', new mongoose.Schema({
    userName: {type: String, unique: true}
    , date_joined: Date
	, password: {type: String}
    , salt: {type: String}
	, sessions: [{
        subject: String
        , startTime: Date
        , endTime: Date
        , enhanced: Boolean
        , whitelist: [{}]
        , mode: String
        , breaks: [{}]
    }]
}));

exports.getModel = function() {
	return model;
}
