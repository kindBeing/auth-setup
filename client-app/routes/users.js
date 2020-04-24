var express = require('express');
var router = express.Router();

router.get('/', async (req, res, next) => {
    res.send(`Received auth code ${req.query.code}`);
});

module.exports = router;
