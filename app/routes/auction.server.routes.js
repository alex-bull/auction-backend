const auctions = require('../controllers/auction.server.controller');

module.exports = function(app){
    app.route('/auctions')
        .get(auctions.list)
        .post(auctions.create);

    app.route('/auctions/:id')
        .get(auctions.findId)
        .patch(auctions.patchAuction);

    app.route('/auctions/:id/bids')
        .get(auctions.findBids)
        .post(auctions.postBid);

    app.route('/auctions/:id/photos')
        .post(auctions.postPhoto)
        .get(auctions.findPhoto);

    app.route('/reset')
        .post(auctions.resetDB);

    app.route('/resample')
        .post(auctions.resampleDB);

    app.route('/user')
        .post(auctions.postUser);

    app.route('/user/login')
        .post(auctions.login);

    app.route('/user/logout')
        .post(auctions.logout);

    app.route('/user/:id')
        .get(auctions.findUser)
        .patch(auctions.patchUser);
};