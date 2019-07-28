'use strict';

const Router = require('koa-router');
const miscController = require('./controllers/misc');


const router = new Router();
router.get('/', miscController.getApiInfo);
router.get('/spec', miscController.getSwaggerSpec);
router.get('/status', miscController.healthcheck);
router.get('/html', miscController.sendHtml);
router.get('/script.js', miscController.script);
router.get('/schema', miscController.schema)

module.exports = router;
