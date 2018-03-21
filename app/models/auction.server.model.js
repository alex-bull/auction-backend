const db = require('../../config/db');
const fs = require('fs');
const moment = require('moment');

const resetQuery = fs.readFileSync("create_database.sql", 'utf8');
const resampleQuery = fs.readFileSync("load_data.sql", 'utf8');

let loggedInUserId = null;

exports.getAll = function(req, res, done){
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

        if(err){
            res.status(400);
            return done("Bad request.");
        }

        res.status(200);
        return done(rows);
    });
};

exports.getOne = function(req, res, done){

    db.get_pool().query('SELECT * ' +
        'FROM auction ' +
        'WHERE auction_id=' + req.params['id'], function (err, rows) {

        if (rows.length === 0) {
            res.status(404);
            return done("Not found");
        }

        if (req.params['id']) {
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

                if (err) {
                    res.status(400);
                    return done("Bad request");
                }

                res.status(200);
                return done(rows);

            });
        } else {
            res.status(404);
            return done("Not found");
        }
    });
};

exports.insert = function(auction, res, done){
    if(loggedInUserId == null){
        res.status(401);
        return done("Unauthorized");
    }

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

        if (err){
            res.status(400);
            return done("Bad request.");
        }

        res.status(200);
        return done(result);
    });
};

exports.reset = function(res, done){
    db.get_pool().query(resetQuery, function (err, rows) {

        if (err){
            res.status(400);
            return done("Bad request.");
        }

        res.status(200);
        return done(rows);
    });
};

exports.resample = function(res, done){
    db.get_pool().query(resetQuery + resampleQuery, function (err) {

        if (err){
            res.status(400);
            return done("Bad request.");
        }

        res.status(201);
        return done("Sample of data has been reloaded.");
    });
};

exports.getBids = function(req, res, done){
    if(req.params['id']){
        db.get_pool().query('SELECT bid_amount AS amount, bid_datetime AS datetime, ' +
            'bid_userid AS buyerId, user_username AS buyerUsername ' +
            'FROM bid ' +
            'JOIN auction_user ON bid.bid_userid=auction_user.user_id ' +
            'WHERE bid_auctionid=' + req.params['id'], function (err, rows) {

            if (err){
                res.status(400);
                return done("Bad request.");
            }

            if(rows.length === 0){
                res.status(404);
                return done("Not found");
            }

            res.status(200);
            return done(rows);
        });
    } else {
        res.status(404);
        return done("Not found");
    }
};

exports.createBid = function(body, req, res, done){
    if(loggedInUserId == null){
        res.status(401);
        return done("Unauthorized");
    }

    if(req.params['id']) {
        let values = [req.params['id'],
            req.query.amount,
            new Date(moment()),
            loggedInUserId];
        db.get_pool().query('INSERT INTO bid (bid_auctionid, bid_amount, ' +
            'bid_datetime, bid_userid) VALUES (?);', [values], function (err, result) {

            if (err){
                res.status(400);
                return done("Bad request.");
            }

            res.status(200);
            return done(result);
        });
    } else {
        res.status(404);
        return done("Not found");
    }
};

exports.updateAuction = function(body, req, res, done){

    db.get_pool().query('SELECT auction_userid, COUNT(bid_id) ' +
        'FROM auction ' +
        'JOIN bid ON auction.auction_id=bid_auctionid ' +
        'WHERE auction_id=' + req.params['id'], function (err, rows) {

        if (err) {
            res.status(500);
            return done("Internal server error");
        }

        if (parseInt(loggedInUserId) !== parseInt(rows[0].auction_userid)) {
            res.status(401);
            return done("Unauthorized");
        }

        if (rows[0]['COUNT(bid_id)'] > 0) {
            res.status(403);
            return done("Forbidden - bidding has begun on the auction.");
        }

        let startDate = new Date(body.startDateTime);
        let endDate = new Date(body.endDateTime);
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
            searchQuery.push(', auction_startingdate = "' + startDate.toISOString() + '" ');
        }

        if(body.endDateTime){
            searchQuery.push(', auction_endingdate = "' + endDate.toISOString() + '" ');
        }

        if(body.reservePrice){
            searchQuery.push(', auction_reserveprice = ' + body.reservePrice + ' ');
        }

        if(body.startingBid){
            searchQuery.push(', auction_startingprice = ' + body.startingBid + ' ');
        }

        searchQuery.push('WHERE auction_id=' + req.params['id']);

        db.get_pool().query(searchQuery.join(''), function (err, rows){

            if(err){
                res.status(400);
                return done("Bad request.");
            }

            res.status(201);
            return done(rows);
        });
    });
};

exports.createUser = function(body, res, done){
    let values = [body.username, body.givenName, body.familyName, body.email, body.password];
    db.get_pool().query('INSERT INTO auction_user (user_username, user_givenname, ' +
        'user_familyname, user_email, user_password) VALUES (?);', [values], function(err, result){

        if (err){
            res.status(400);
            return done("Malformed request");
        }

        res.status(201);
        return done(result);
    });
};

exports.loginUser = function(req, res, done){

    if(req.query.password) {

        db.get_pool().query('SELECT user_password, user_id ' +
            'FROM auction_user ' +
            'WHERE user_username="' + req.query.username + '" OR user_email="' + req.query.email + '" ',
            function (err, userDetails) {

                if (err){
                    res.status(400);
                    return done("Invalid username/email/password supplied");
                }

                if(userDetails.length > 0){

                    if(userDetails[0].user_password === req.query.password) {
                    loggedInUserId = userDetails[0].user_id;
                    res.status(200);
                    return done("Log in successful");

                } else {
                        res.status(400);
                        return done("Invalid username/email/password supplied");
                }

            } else {
                    res.status(400);
                    return done("User not in database");
                }
        });
    } else {
        res.status(400);
        return done("Please input a password")
    }
};

exports.logoutUser = function(res, done){
    if(loggedInUserId == null){
        res.status(401);
        return done("Unauthorized");
    }
    loggedInUserId = null;
    res.status(200);
    return done("Logged out");
};

exports.getUser = function(req, res, done){

    let searchQuery = ['SELECT user_username AS username, user_givenname AS givenName, ' +
        'user_familyname AS familyName '];

    if(loggedInUserId === parseInt(req.params['id'])){
        searchQuery.push(', user_email AS email, user_accountbalance AS accountBalance ');
    }

    searchQuery.push('FROM auction_user ' +
        'WHERE user_id=' + req.params['id']);

    if(req.params['id']){
        db.get_pool().query(searchQuery.join(''), function (err, rows) {

            if (err || rows.length === 0){
                res.status(404);
                return done("Not found");
            }

            res.status(200);
            return done(rows);
        });
    } else {
        res.status(404);
        return done("Not found");
    }
};


exports.updateUser = function(body, req, res, done){

    if (parseInt(req.params['id']) !== parseInt(loggedInUserId)) {
        res.status(401);
        return done("Unauthorized");
    }

    let searchQuery = ['UPDATE auction_user ' +
    'SET user_id = user_id'];

    if(body.username){
        searchQuery.push(', user_username = "' + body.username + '"');
    }

    if(body.givenName){
        searchQuery.push(', user_givenname = "' + body.givenName + '"');
    }

    if(body.familyName){
        searchQuery.push(', user_familyname = "' + body.familyName + '"');
    }

    if(body.email){
        searchQuery.push(', user_email = "' + body.email + '"');
    }

    if(body.password){
        searchQuery.push(', user_password = "' + body.password + '"');
    }

    searchQuery.push(' WHERE user_id=' + req.params['id']);


    db.get_pool().query(searchQuery.join(''), function (err, rows){

        if(err){
            res.status(400);
            return done("Bad request");
        }

        res.status(201);
        return done(rows);
    });
};

exports.addPhoto = function(req, res, done){

    db.get_pool().query('SELECT * ' +
        'FROM auction ' +
        'WHERE auction_id=' + req.params['id'], function (err, rows) {

        if (rows.length === 0) {
            res.status(404);
            return done("Not found");
        }

        if (parseInt(req.params['id']) !== parseInt(loggedInUserId)) {
            res.status(401);
            return done("Unauthorized");
        }

        let uri = req.pipe(fs.createWriteStream('photos/' + moment()));

        let values = [req.params['id'], uri.path];
        db.get_pool().query('INSERT INTO photo (photo_auctionid, photo_image_URI) ' +
            'VALUES (?);', [values], function (err, result) {

            if (err) {
                res.status(400);
                return done("Bad request");
            }

            res.status(201);
            return done(result);
        });
    });
};

exports.getPhoto = function(req, res, done){

    db.get_pool().query('SELECT * ' +
        'FROM auction ' +
        'WHERE auction_id=' + req.params['id'], function (err, rows) {

        if (rows.length === 0) {
            res.status(404);
            return done("Not found");
        }

        db.get_pool().query('SELECT photo_image_URI ' +
            'FROM photo ' +
            'WHERE photo_auctionid=' + req.params['id'], function (err, result) {

            if (err){
                res.status(400);
                return done("Bad request");
            }

            if (result.length === 0) {
                res.status(404);
                return done("Not found");
            }

            let photoData = fs.readFileSync(result[0].photo_image_URI, 'utf8');

            return done(photoData);
        });
    });
};

exports.removePhoto = function(req, res, done){

    db.get_pool().query('SELECT * ' +
        'FROM auction ' +
        'WHERE auction_id=' + req.params['id'], function (err, rows) {

        if (rows.length === 0) {
            res.status(404);
            return done("Not found");
        }

        if (parseInt(req.params['id']) !== (loggedInUserId)) {
            res.status(401);
            return done("Unauthorized");
        }

        db.get_pool().query('DELETE FROM photo ' +
            'WHERE photo_auctionid=' + req.params['id'], function (err, result) {

            if (err){
                res.status(400);
                return done("Bad request");
            }

            return done(result);
        });
    });
};