const auctions = require('../controllers/auction.server.controller');

module.exports = function(app){
    app.route('/auctions')
        .get(auctions.list)
        .post(auctions.create);

    app.route('/reset')
        .post(auctions.resetDB);

    app.route('/resample')
        .post(auctions.resampleDB);
};