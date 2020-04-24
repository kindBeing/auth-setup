const express = require('express');
const router = express.Router();
const {Issuer} = require('openid-client');

const client_id = 'foo'
const client_secret = 'bar'
const redirect_uri = 'http://localhost:3000/users';
const authUrl = 'http://localhost:4000';

router.get('/', async function (req, res, next) {
    const authProvider = await Issuer.discover(authUrl);
    const client = new authProvider.Client({
        client_id: client_id,
        client_secret: client_secret,
        redirect_uris: [redirect_uri]
    })

    res.redirect(client.authorizationUrl());
});

module.exports = router;