const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(req, function(result){
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

exports.findId = function(req, res){
    Auction.getOne(req, function(result){
        res.json(result);
    });
};

exports.findBids = function(req, res){
    Auction.getBids(req, function(result){
        res.json(result);
    });
};

exports.postBid = function(req, res){
    let body = req.body;
    Auction.createBid(body, req, function(result){
        res.json(result);
    });
};

exports.patchAuction = function(req, res){
    let body = req.body;
    Auction.updateAuction(body, req, function(result){
        res.json(result);
    });
};