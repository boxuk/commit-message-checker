'use strict';

const CommitMessageParser = require('../commit-message-parser');
const ValidationResult = require('../validation-result');

module.exports = class HasValidCommitTypeRule {

    constructor () {
        this.type = 'MISSING_OR_INVALID_COMMIT_TYPE';
    }

    /**
     * Check that a commit message has a valid commit type (e.g. BUG, FEATURE, etc.).
     *
     * @param {string} commitMessage
     *
     * @returns {ValidationResult}
     */
    validate (commitMessage) {
        const commitType = CommitMessageParser.getCommitType(commitMessage);

        if (commitType) {
            return new ValidationResult(commitMessage);
        }

        return new ValidationResult(commitMessage, [this.type]);
    }
};
