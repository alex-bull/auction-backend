const db = require('../../config/db');
const fs = require('fs');

const resetQuery = fs.readFileSync("create_database.sql", 'utf8');
const resampleQuery = fs.readFileSync("load_data.sql", 'utf8');


exports.getAll = function(done){
    db.get_pool().query('SELECT * from auction ORDER BY auction_startingdate', function (err, rows){

        if(err) return done({"ERROR": "Error selecting"});

        return done(rows);
    });
};

exports.getOne = function(){
    return null;
};

exports.insert = function(){
    return null;
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