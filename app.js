const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const mysql = require('mysql');

function connect(){
    let con = mysql.createConnection({
        host: 'mysql3.csse.canterbury.ac.nz',
        user: 'abu59',
        password: '11213398',
        database: 'abu59'
    });
    return con;
}

// const con = connect();
// con.connect(function(err){
//     if(err) throw err;
//     con.query("SELECT * FROM auction", function(err, result) {
//         if (err) throw err;
//         console.log(result);
//     });
// });

app.get("/auction", function (req, res){
    const con = connect();
    con.connect(function (err){
        if (!err){
            console.log("Connected to the database");
            con.query('SELECT * from auction ORDER BY auction_startingdate', function(err, rows, fields){
                con.end();
                if(!err){
                    res.send(JSON.stringify(rows));
                } else {
                    console.log(err);
                    res.send({"ERROR": "Error getting users"});
                }
            });
        } else {
            console.log("Error connecting to database");
            res.send({"ERROR": "Error connecting to database"});
        }
    });
});


app.listen(3000, function(){
    console.log('Example app listening on port: ' + 3000);
});