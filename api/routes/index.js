const express = require('express');
const router = express.Router();

const fs = require('fs');
let routes = fs.readdirSync(__dirname);

for (let route of routes) {
  if (route.endsWith('.js') && route !== 'index.js') {
    router.use(`/${route.replace('.js', '')}`, require('./' + route));
  }
}

module.exports = router;
