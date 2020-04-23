var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req)

  const authUrl = new URL('http://localhost:4000/auth')

  const queryParams = {
    client_id: 'foo',
    client_secret: 'bar',
    redirect_uri: 'http://localhost:3500/users',
    response_type: 'code',
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
