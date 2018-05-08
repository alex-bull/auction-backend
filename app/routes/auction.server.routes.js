const auctions = require('../controllers/auction.server.controller');

const API_VER = '/api/v1';

module.exports = function(app){
    app.route(API_VER + '/auctions')
        .get(auctions.list)
        .post(auctions.create);

    app.route(API_VER + '/auctions/:id')
        .get(auctions.findId)
        .patch(auctions.patchAuction);

    app.route(API_VER + '/auctions/:id/bids')
        .get(auctions.findBids)
        .post(auctions.postBid);

    app.route(API_VER + '/auctions/:id/photos')
        .post(auctions.postPhoto)
        .get(auctions.findPhoto)
        .delete(auctions.deletePhoto);

    app.route(API_VER + '/reset')
        .post(auctions.resetDB);

    app.route(API_VER + '/resample')
        .post(auctions.resampleDB);

    app.route(API_VER + '/users')
        .post(auctions.postUser);

    app.route(API_VER + '/users/login')
        .post(auctions.login);

    app.route(API_VER + '/users/logout')
        .post(auctions.logout);

    app.route(API_VER + '/users/:id')
        .get(auctions.findUser)
        .patch(auctions.patchUser);
};