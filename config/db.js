const mysql = require('mysql');

let state = {
    pool: null
};

exports.connect = function (done){
    state.pool = mysql.createPool({
        host: 'mysql3.csse.canterbury.ac.nz',
        user: 'abu59',
        password: "11213398",
        database: "abu59"
    });
    done();
};

exports.get_pool = function(){
    return state.pool;
};