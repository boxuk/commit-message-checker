'use strict';

const ValidationResult = require('../validation-result');

module.exports = class HasValidCommitTypeRule {

    /**
     * @param {CommitMessageParser} commitMessageParser
     */
    constructor (commitMessageParser) {

        /**
         * @type {string}
         */
        this.type = 'MISSING_OR_INVALID_COMMIT_TYPE';

        /**
         * @type {CommitMessageParser}
         * @private
         */
        this._commitMessageParser = commitMessageParser;
    }

    /**
     * Check that a commit message has a valid commit type (e.g. BUG, FEATURE, etc.).
     *
     * @param {string} commitMessage
     *
     * @returns {ValidationResult}
     */
    validate (commitMessage) {
        const commitType = this._commitMessageParser.getCommitType(commitMessage);

        if (commitType) {
            return new ValidationResult(commitMessage);
        }

        return new ValidationResult(commitMessage, [this.type]);
    }
};
