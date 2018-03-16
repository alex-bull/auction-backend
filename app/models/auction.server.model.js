const db = require('../../config/db');
const fs = require('fs');

const resetQuery = fs.readFileSync("create_database.sql", 'utf8');
const resampleQuery = fs.readFileSync("load_data.sql", 'utf8');


exports.getAll = function(done){
    db.get_pool().query('SELECT auction_id AS id, category_title AS categoryTitle, ' +
        'auction_categoryid AS categoryId, auction_title AS title, auction_reserveprice AS reservePrice, ' +
        'auction_startingdate AS startDateTime, auction_endingdate AS endDateTime, ' +
        'MAX(bid_amount) AS currentBid ' +
        'FROM auction ' +
        'JOIN category ON auction.auction_categoryid = category.category_id ' +
        'JOIN bid ON auction.auction_id = bid.bid_auctionid ' +
        'GROUP BY auction_id ' +
        'ORDER BY auction_startingdate', function (err, rows){

        if(err) return done({"ERROR": "Error selecting"});

        return done(rows);
    });
};

exports.getOne = function(){
    return null;
};

exports.insert = function(auction, done){
    let values = [auction.auction_title,
        auction.auction_categoryid,
        auction.auction_description,
        auction.auction_reserveprice,
        auction.auction_startingprice,
        new Date(auction.auction_creationdate),
        new Date(auction.auction_startingdate),
        new Date(auction.auction_endingdate),
        auction.auction_userid];
    db.get_pool().query('INSERT INTO auction (auction_title, auction_categoryid, auction_description, ' +
        'auction_reserveprice, auction_startingprice, auction_creationdate, auction_startingdate, ' +
        'auction_endingdate, auction_userid) VALUES (?);', [values], function(err, result){

        if (err) return done(err);

        done(result);
    });
};

exports.alter = function(){
    return null;
};


exports.remove = function(){
    return null;
};

exports.reset = function(done){
    db.get_pool().query(resetQuery, function (err, rows) {

        if (err) return done({"ERROR": "Error reseting"});

        return done(rows);
    });
};

exports.resample = function(done){
    db.get_pool().query(resetQuery + resampleQuery, function (err, rows) {

        if (err) return done({"ERROR": "Error resampling"});

        return done(rows);
    });
};