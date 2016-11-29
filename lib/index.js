'use strict';

const childProcess = require('child_process');

const CommitMessageParser = require('./commit-message-parser');
const GitHelper = require('./git-helper');
const Validator = require('./validator');

// Import rules
const ValidSummaryRule = require('./rules/valid-summary-rule');
const HasValidCommitTypeRule = require('./rules/has-valid-commit-type-rule');
const HasNewLineBetweenSummaryAndDescriptionRule = require('./rules/has-new-line-between-summary-and-description-rule');

const commitMessageParser = new CommitMessageParser();

// Cofigure the rules that we'll test commit messages against
const rules = [
    new ValidSummaryRule(commitMessageParser),
    new HasValidCommitTypeRule(commitMessageParser),
    new HasNewLineBetweenSummaryAndDescriptionRule(commitMessageParser)
];

const gitHelper = new GitHelper(childProcess.exec);
const validator = new Validator(gitHelper, commitMessageParser, rules);

module.exports = validator;
