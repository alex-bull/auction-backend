const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: 100,
    host: 'mysql3.csse.canterbury.ac.nz',
    user: 'abu59',
    password: '11213398',
    database: 'abu59'
});

// const con = connect();
// con.connect(function(err){
//     if(err) throw err;
//     con.query("SELECT * FROM auction", function(err, result) {
//         if (err) throw err;
//         console.log(result);
//     });
// });

function get_auctions(req, res) {
    pool.getConnection(function(err, connection){
        if(err){
            console.log(err);
            res.json({"ERROR": "Error in connection database"});
            return;
        }
        console.log('connected as id ' + connection.threadId);
        connection.query("SELECT * from auction ORDER BY auction_startingdate", function(err, rows){
            connection.release();
            if(!err){
                res.json(rows);
            }
        });
        connection.on('error', function(err){
            res.json({"ERROR": "Error in connection database"});
            return;
        });
    });
}

app.get("/auction", function(req, res){
    get_auctions(req, res);
});


app.listen(3000, function(){
    console.log('Example app listening on port: ' + 3000);
});