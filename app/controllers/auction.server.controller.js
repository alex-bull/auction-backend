const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(req, res, function(result){
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

exports.postUser = function(req, res){
    let body = req.body;
    Auction.createUser(body, function(result){
        res.json(result);
    });
};

exports.login = function(req, res){
    Auction.loginUser(req, function(result){
        res.json(result);
    });
};

exports.logout = function(req, res){
    Auction.logoutUser(function(result){
        res.json(result);
    });
};

exports.findUser = function(req, res){
    Auction.getUser(req, function(result){
        res.json(result);
    });
};

exports.patchUser = function(req, res){
    let body = req.body;
    Auction.updateUser(body, req, function(result){
        res.json(result);
    });
};

exports.postPhoto = function(req, res){
    Auction.addPhoto(req, function(result){
        res.json(result);
    });
};

exports.findPhoto = function(req, res){
    Auction.getPhoto(req, function(result){
        res.send(result);
    });
};

exports.deletePhoto = function(req, res){
    Auction.removePhoto(req, function(result){
        res.json(result);
    });
};