const express = require('express');
const router = express.Router();
const authClient = require('../auth-client');

router.get('/', async (req, res, next) => {
    let client = authClient.getClient();

    const params = client.callbackParams(req);

    client.callback(authClient.redirect_uri, params)
        .then((tokenSet) => {
            res.json('Token response from server ||| ' + JSON.stringify(tokenSet, null, 4));
        })
        .catch(() => {
            res.send(`Could not get an access token for authorization code ${req.query.code}`);
        });
});

module.exports = router;
