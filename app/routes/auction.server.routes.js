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
        .get(auctions.findPhoto)
        .delete(auctions.deletePhoto);

    app.route('/reset')
        .post(auctions.resetDB);

    app.route('/resample')
        .post(auctions.resampleDB);

    app.route('/users')
        .post(auctions.postUser);

    app.route('/users/login')
        .post(auctions.login);

    app.route('/users/logout')
        .post(auctions.logout);

    app.route('/users/:id')
        .get(auctions.findUser)
        .patch(auctions.patchUser);
};