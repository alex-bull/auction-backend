const db = require('../../config/db');
const fs = require('fs');
const moment = require('moment');

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

exports.getOne = function(req, done){
    if(req.params['id']){
        db.get_pool().query('SELECT auction_categoryid AS categoryId, category_title AS categoryTitle, ' +
            'auction_title AS title, auction_reserveprice AS reservePrice, ' +
            'auction_startingdate AS startDateTime, auction_endingdate AS endDateTime, ' +
            'auction_description AS description, auction_creationdate AS creationDateTime, ' +
            'auction_userid AS id, user_username AS username, auction_startingprice as startingBid, ' +
            'MAX(bid_amount) AS currentBid ' +
            'FROM auction ' +
            'JOIN auction_user ON auction.auction_userid=auction_user.user_id ' +
            'LEFT JOIN bid ON auction.auction_id = bid.bid_auctionid ' +
            'JOIN category ON auction.auction_categoryid = category.category_id ' +
            'WHERE auction_id=' + req.params['id'], function (err, rows) {

            if (err) return done({"ERROR": "Error selecting"});

            return done(rows);
        });
    } else {
        return done("No ID entered");
    }
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

        return done(result);
    });
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

exports.getBids = function(req, done){
    if(req.params['id']){
        db.get_pool().query('SELECT bid_amount AS amount, bid_datetime AS datetime, ' +
            'bid_userid AS buyerId, user_username AS buyerUsername ' +
            'FROM bid ' +
            'JOIN auction_user ON bid.bid_userid=auction_user.user_id ' +
            'WHERE bid_auctionid=' + req.params['id'], function (err, rows) {

            if (err) return done({"ERROR": "Error selecting"});

            return done(rows);
        });
    } else {
        return done("No ID entered");
    }
};

exports.createBid = function(body, req, done){
    if(req.query.amount) {
        let values = [req.params['id'],
            req.query.amount,
            new Date(moment()),
            loggedInUserId];
        db.get_pool().query('INSERT INTO bid (bid_auctionid, bid_amount, ' +
            'bid_datetime, bid_userid) VALUES (?);', [values], function (err, result) {

            if (err) return done(err);

            return done(result);
        });
    } else {
        return done("No bid amount selected.");
    }
};

exports.updateAuction = function(body, req, done){
    let searchQuery = ['UPDATE auction ' +
    'SET auction_id = auction_id '];

    if(body.categoryId){
        searchQuery.push(', auction_categoryid = ' + body.categoryId + ' ');
    }

    if(body.title){
        searchQuery.push(', auction_title = "' + body.title + '" ');
    }

    if(body.description){
        searchQuery.push(', auction_description = "' + body.description + '" ');
    }

    if(body.startDateTime){
        searchQuery.push(', auction_startingdate = ' + body.startDateTime + ' ');
    }

    if(body.endDateTime){
        searchQuery.push(', auction_endingdate = ' + body.endDateTime + ' ');
    }

    if(body.reservePrice){
        searchQuery.push(', auction_reserveprice = ' + body.reservePrice + ' ');
    }

    if(body.startingBid){
        searchQuery.push(', auction_startingprice = ' + body.startingBid + ' ');
    }

    searchQuery.push('WHERE auction_id=' + req.params['id']);

    console.log(searchQuery);
    db.get_pool().query(searchQuery.join(''), function (err, rows){

        if(err) return done({"ERROR": "Error updating"});

        return done(rows);
    });
};