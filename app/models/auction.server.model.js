const db = require('../../config/db');
const fs = require('fs');

const resetQuery = fs.readFileSync("create_database.sql", 'utf8');
const resampleQuery = fs.readFileSync("load_data.sql", 'utf8');

let loggedInUserId = 1;

exports.getAll = function(req, done){
    let searchQuery = ['SELECT auction_id AS id, category_title AS categoryTitle, ' +
    'auction_categoryid AS categoryId, auction_title AS title, auction_reserveprice AS reservePrice, ' +
    'auction_startingdate AS startDateTime, auction_endingdate AS endDateTime, ' +
    'MAX(bid_amount) AS currentBid ' +
    'FROM auction ' +
    'JOIN category ON auction.auction_categoryid = category.category_id ' +
    'LEFT JOIN bid ON auction.auction_id = bid.bid_auctionid ' +
    'WHERE auction_id!="null" '];

    if(req.query.q){
        searchQuery.push('AND auction_title LIKE "%' + req.query.q + '%" ');
    }

    if(req.query['category-id']){
        searchQuery.push('AND auction_categoryid=' + req.query['category-id'] + ' ');
    }

    if(req.query.seller){
        searchQuery.push('AND auction_userid=' + req.query.seller + ' ');
    }

    if(req.query.bidder){
        searchQuery.push('AND bid_userid=' + req.query.bidder + ' ');
    }

    // if(req.query.bidder){
    //     searchQuery.push('AND auction_id = ANY (SELECT bid_auctionid, MAX() FROM bid WHERE bid_userid=' + req.query.bidder + ') ');
    // }


    searchQuery.push('GROUP BY auction_id ' +
    'ORDER BY auction_startingdate');
    db.get_pool().query(searchQuery.join(''), function (err, rows){

        if(req.query.startIndex){
            rows = rows.copyWithin(0, req.query.startIndex);
        }

        if(req.query['count']){
            rows = rows.slice(0, req.query['count']);
        }

        if(err) return done({"ERROR": "Error selecting"});

        return done(rows);
    });
};

exports.getOne = function(){
    return null;
};

exports.insert = function(auction, done){
    let values = [auction.categoryId,
        auction.title,
        auction.description,
        new Date(auction.startDateTime),
        new Date(auction.endDateTime),
        auction.reservePrice,
        auction.startingBid,
        loggedInUserId];
    db.get_pool().query('INSERT INTO auction (auction_categoryid, auction_title, ' +
        'auction_description, auction_startingdate, ' +
        'auction_endingdate, auction_reserveprice, ' +
        'auction_startingprice, auction_userid) VALUES (?);', [values], function(err, result){

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