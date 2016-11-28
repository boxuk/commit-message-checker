'use strict';

const childProcess = require('child_process');

const GitHelper = require('./git-helper');
const Validator = require('./validator');

// Import rules
const ValidSummaryRule = require('./rules/valid-summary-rule');
const HasValidCommitTypeRule = require('./rules/has-valid-commit-type-rule');
const HasNewLineBetweenSummaryAndDescriptionRule = require('./rules/has-new-line-between-summary-and-description-rule');

// Cofigure the rules that we'll test commit messages against
const rules = [
    new ValidSummaryRule(),
    new HasValidCommitTypeRule(),
    new HasNewLineBetweenSummaryAndDescriptionRule()
];

const gitHelper = new GitHelper(childProcess.exec);
const validator = new Validator(gitHelper, rules);

module.exports = validator;
