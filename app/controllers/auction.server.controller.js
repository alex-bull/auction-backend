const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(function(result){
        res.json(result);
    });
};

exports.create = function(req, res){
    let body = req.body;
    Auction.insert(body, function(result){
        res.json(result);
    });
};

exports.resetDB = function(req, res){
    Auction.reset(function(result){
        res.json(result);
    });
};

exports.resampleDB = function(req, res){
    Auction.resample(function(result){
        res.json(result);
    });
};