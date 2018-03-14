const db = require('../../config/db');

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