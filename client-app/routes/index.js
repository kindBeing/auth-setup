const express = require('express');
const router = express.Router();
const authClient = require('../auth-client')

router.get('/', async function (req, res, next) {

    //Initialize client only if access_token is not present
    authClient.initiateAuthorization().then(() => {
        res.redirect(authClient.getClient().authorizationUrl());
    })
});

module.exports = router;