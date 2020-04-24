const Provider = require('oidc-provider');
const express = require('express')
const helper = require('./helpers')
const path = require('path');
const bodyParser = require('body-parser');
const Account = require('./account')

const configuration = {
    clients: [
        {
            client_id: 'foo',
            client_secret: 'bar',
            redirect_uris: ['http://localhost:3000/users'],
        }
    ],
    findAccount: Account.findAccount,
    // let's tell oidc-provider where our own interactions will be
    // setting a nested route is just good practice so that users
    // don't run into weird issues with multiple interactions open
    // at a time.
    interactions: {
        url(ctx) {
            return `/interaction/${ctx.oidc.uid}`;
        },
    },
    features: {
        // disable the packaged interactions
        devInteractions: {enabled: false},

        introspection: {enabled: true},
        revocation: {enabled: true},
    },
}

const oidcProvider = new Provider('http://localhost:4000', configuration)

const expressApp = express();
expressApp.set('trust proxy', true);
expressApp.set('view engine', 'ejs');
expressApp.set('views', path.resolve(__dirname, 'views'));
expressApp.use(bodyParser.urlencoded({extended: false}))

expressApp.get('/auth', async (req, res, next) => {
    try {
        console.log('At /auth endpoint');
        next()
    } catch (err) {
        return next(err);
    }
})

expressApp.get('/interaction/:uid', helper.setNoCache, async (req, res, next) => {
    try {
        console.log('At /interaction/:uid endpoint');

        const {uid, prompt, params} = await oidcProvider.interactionDetails(req, res);

        // Find the client id in the client list
        const client = await oidcProvider.Client.find(params.client_id);

        // We can present the user with our custom login page. Replace the login file in the views directory
        // with our custom login page and setup the rendering engine of our choice.

        if (prompt.name === 'login') {
            return res.render('login', {
                client,
                uid,
                details: prompt.details,
                params,
                title: 'Sign-in',
                flash: undefined,
            });
        }

        return res.render('interaction', {
            client,
            uid,
            details: prompt.details,
            params,
            title: 'Authorize',
        });
    } catch (err) {
        return next(err);
    }
});

expressApp.post('/interaction/:uid/login', helper.setNoCache, async (req, res, next) => {
    try {
        console.log('At /interaction/:uid/login endpoint');

        const {uid, prompt, params} = await oidcProvider.interactionDetails(req, res);

        const client = await oidcProvider.Client.find(params.client_id);

        const accountId = await Account.authenticate(req.body.email, req.body.password);

        if (!accountId) {
            res.render('login', {
                client,
                uid,
                details: prompt.details,
                params: {
                    ...params,
                    login_hint: req.body.email,
                },
                title: 'Sign-in',
                flash: 'Invalid email or password.',
            });
            return;
        }

        const result = {
            login: {
                account: accountId,
            },
        };

        await oidcProvider.interactionFinished(req, res, result, {mergeWithLastSubmission: false});
    } catch (err) {
        next(err);
    }
});

// expressApp.get('/auth/:uid', helper.setNoCache, async (req, res, next) => {
//     console.log('At /auth/:uid endpoint')
//     next()
// })

expressApp.post('/interaction/:uid/confirm', helper.setNoCache, async (req, res, next) => {
    try {
        console.log('At the /interaction/:uid/confirm endpoint')
        const result = {
            consent: {
                // rejectedScopes: [], // < uncomment and add rejections here
                // rejectedClaims: [], // < uncomment and add rejections here
            },
        };
        await oidcProvider.interactionFinished(req, res, result, {mergeWithLastSubmission: true});
    } catch (err) {
        next(err);
    }
});

expressApp.get('/interaction/:uid/abort', helper.setNoCache, async (req, res, next) => {
    try {
        console.log('At the /interaction/:uid/abort endpoint')
        const result = {
            error: 'access_denied',
            error_description: 'End-User aborted interaction',
        };
        await oidcProvider.interactionFinished(req, res, result, {mergeWithLastSubmission: false});
    } catch (err) {
        next(err);
    }
});

//TODO: switch places leave the rest of the requests to be handled by oidc-provider, there's a catch all 404 there
expressApp.use(oidcProvider.callback)

expressApp.listen(4000, () => {
    console.log('Provider Started')
})
