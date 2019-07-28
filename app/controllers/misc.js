'use strict';

const os = require('os');
const pkginfo = require('../../package.json');
const spec = require('../spec');
const fs = require('fs')
const path = require('path')

const { getStructure } =require('./lib')



/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *     - misc
 *     - public
 *     summary: Get a general API information.
 *     operationId: getApiInfo
 *     responses:
 *       '200':
 *         x-summary: OK
 *         description: OK
 *         content:
 *           application/json:
 *             example:
 *               name: 'koa-rest-api-boilerplate'
 *               version: 'v2.0.0'
 *               description: 'Boilerplate for Koa RESTful API application with Docker, Swagger, Jest, Coveralls, and Circle CI'
 *               environments:
 *                 nodeVersion: '10.15.0'
 *                 hostname: 'my-pc'
 *                 platform: 'darwin/x64'
 */
exports.getApiInfo = ctx => {
  // BUSINESS LOGIC
  const environments = {
    nodeVersion: process.versions['node'],
    hostname: os.hostname(),
    platform: `${process.platform}/${process.arch}`
  };
  const data = {
    name: pkginfo.name,
    version: pkginfo.version,
    description: pkginfo.description,
    environments
  };

  ctx.body = data;
};

/**
 * @swagger
 * /spec:
 *   get:
 *     tags:
 *     - misc
 *     - public
 *     summary: Get Open API Specification.
 *     operationId: getSwaggerSpec
 *     responses:
 *       '200':
 *         x-summary: OK
 *         description: Describe Swagger Open API Specification
 */
exports.getSwaggerSpec = ctx => {
  ctx.body = spec;
};

/**
 * @swagger
 * /status:
 *   get:
 *     tags:
 *     - misc
 *     - public
 *     summary: Provide a detailed information about the service health.
 *     operationId: getSwaggerSpec
 *     responses:
 *       '200':
 *         x-summary: OK
 *         description: Healthy Service
 *         content:
 *           application/json:
 *             example:
 *               status: 'pass'
 */
exports.healthcheck = ctx => {
  // TODO: Improve healthcheck logic
  // status: ['pass', 'fail', 'warn']
  const data = {
    status: 'pass'
  };
  ctx.body = data;
};

var readFileThunk = function(src) {
  return new Promise(function (resolve, reject) {
    fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
      if(err) return reject(err);
      resolve(data);
    });
  });
}

exports.sendHtml = async function (ctx) {
  const res = await readFileThunk(path.resolve(__dirname,'../script/row_script.html'));
  ctx.body = res
}

exports.script = async function (ctx) {
  const res = await readFileThunk(path.resolve(__dirname,'../script/script.js'));
  ctx.body = res
}

exports.schema = async function (ctx) {
  const res = await readFileThunk(path.resolve(__dirname,'../script/row_script.html'));
  let res2
  try {
    res2 = getStructure(res)
    ctx.body = JSON.stringify(res2)
  } catch(e) { ctx.body = e.toString()}
}
