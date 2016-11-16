'use strict';

const COMMIT_TYPES = require('./commit-types').COMMIT_TYPES;

const FAILURE_REASONS = {
    noNewLineAfterFirstLine: 'NO_NEW_LINE_AFTER_FIRST_LINE',
    missingOrInvalidCommitType: 'MISSING_OR_INVALID_COMMIT_TYPE',
    firstLineInvalidFormat: 'FIRST_LINE_INVALID_FORMAT'
};

const EXPLANATIONS = {};

EXPLANATIONS[FAILURE_REASONS.missingOrInvalidCommitType] = `The commit message is missing a commit type, e.g.` +
    `"[J#PROJ-123][FEATURE] Add foo feature". Accepted commit types are: ${COMMIT_TYPES.join(', ')}`;

EXPLANATIONS[FAILURE_REASONS.noNewLineAfterFirstLine] = 'There is a missing new-line after the first ' +
    'line. Multi-line commit messages should have a new line between the first line (a terse ' +
    'description of the change) and the longer commit description.';

EXPLANATIONS[FAILURE_REASONS.firstLineInvalidFormat] = 'The first line of the commit message does not ' +
    'match the expected format. Commit messages should be in the format: ' +
    '"[J#PROJ-123][BUG] Fix issue with foo".';

exports.FAILURE_REASONS = FAILURE_REASONS;
exports.EXPLANATIONS = EXPLANATIONS;
