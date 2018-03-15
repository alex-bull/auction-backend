const auctions = require('../controllers/auction.server.controller');

module.exports = function(app){
    app.route('/auction')
        .get(auctions.list);
        //.post(auction.create);

    app.route('/reset')
        .post(auctions.resetDB);

    app.route('/resample')
        .post(auctions.resampleDB);
};