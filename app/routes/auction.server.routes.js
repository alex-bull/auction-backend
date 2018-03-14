const auctions = require('../controllers/auction.server.controller');

module.exports = function(app){
    app.route('/auction')
        .get(auctions.list)
        //.post(auction.create);
}