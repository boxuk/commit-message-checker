'use strict';

const childProcess = require('child_process');

const GitHelper = require('./git-helper');
const Validator = require('./validator');

const gitHelper = new GitHelper(childProcess.exec);
const validator = new Validator(gitHelper);

module.exports = validator;
