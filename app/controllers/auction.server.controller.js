const Auction = require('../models/auction.server.model');

exports.list = function(req, res){
    Auction.getAll(req, res, function(result){
        res.json(result);
    });
};

exports.create = function(req, res){
    let body = req.body;
    Auction.insert(body, res, function(result){
        res.json(result);
    });
};

exports.resetDB = function(req, res){
    Auction.reset(res, function(result){
        res.json(result);
    });
};

exports.resampleDB = function(req, res){
    Auction.resample(res, function(result){
        res.json(result);
    });
};

exports.findId = function(req, res){
    Auction.getOne(req, res, function(result){
        res.json(result);
    });
};

exports.findBids = function(req, res){
    Auction.getBids(req, res, function(result){
        res.json(result);
    });
};

exports.postBid = function(req, res){
    let body = req.body;
    Auction.createBid(body, req, res, function(result){
        res.json(result);
    });
};

exports.patchAuction = function(req, res){
    let body = req.body;
    Auction.updateAuction(body, req, res, function(result){
        res.json(result);
    });
};

exports.postUser = function(req, res){
    let body = req.body;
    Auction.createUser(body, res, function(result){
        res.json(result);
    });
};

exports.login = function(req, res){
    Auction.loginUser(req, res, function(result){
        res.json(result);
    });
};

exports.logout = function(req, res){
    Auction.logoutUser(res, function(result){
        res.json(result);
    });
};

exports.findUser = function(req, res){
    Auction.getUser(req, res, function(result){
        res.json(result);
    });
};

exports.patchUser = function(req, res){
    let body = req.body;
    Auction.updateUser(body, req, res, function(result){
        res.json(result);
    });
};

exports.postPhoto = function(req, res){
    Auction.addPhoto(req, res, function(result){
        res.json(result);
    });
};

exports.findPhoto = function(req, res){
    Auction.getPhoto(req, res, function(result){
        res.send(result);
    });
};

exports.deletePhoto = function(req, res){
    Auction.removePhoto(req, res, function(result){
        res.json(result);
    });
};