var express = require('express');
var router = express.Router();


const client_id = 'foo'
const client_secret = 'bar'
// Authorization: 'Basic ' + Buffer.from(`${process.env.OAUTH_CLIENTID}:${process.env.OAUTH_CLIENTSECRET}`).toString('base64')

router.get('/', function(req, res, next) {
  console.log(req)

  const authUrl = new URL('http://localhost:4000/auth')

  const queryParams = {
    client_id: client_id,
    redirect_uri: 'http://localhost:3000/users',
    response_type: 'code',
    // scope: 'openid'
    // state: 'randomString'
    // scope: 'patient/Patient.read'
  }

  authUrl.search = buildQueryParam(queryParams)

  res.redirect(authUrl)
});

function buildQueryParam(queryParams) {
  const params = new URLSearchParams()
  for (const key in queryParams) {
    params.append(key, queryParams[key])
  }
  return params
}

module.exports = router;
