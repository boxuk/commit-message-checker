'use strict';

const ValidationResult = require('../validation-result');

module.exports = class HasNewLineBetweenSummaryAndDescriptionRule {

    /**
     * @param {CommitMessageParser} commitMessageParser
     */
    constructor (commitMessageParser) {

        /**
         * @type {string}
         */
        this.type = 'NO_NEW_LINE_AFTER_FIRST_LINE';

        /**
         * @type {CommitMessageParser}
         * @private
         */
        this._commitMessageParser = commitMessageParser;
    }

    /**
     * Check that there is a new-line between the commit summary and description.
     *
     * Single line commit messages will just be considered valid.
     *
     * @param {string} commitMessage
     */
    validate (commitMessage) {
        // For single-line commit messages, just consider them valid as testing for a new-line after the summary
        // just doesn't make any sense.
        if (this._commitMessageParser.isSingleLineCommitMessage(commitMessage)) {
            return new ValidationResult(commitMessage);
        }

        // If there's no new line between summary and description, then return a validation result with an
        // appropriate error
        if (!this._hasNewLineBetweenSummaryAndDescription(commitMessage)) {
            return new ValidationResult(commitMessage, [this.type]);
        }

        return new ValidationResult(commitMessage);
    }

    /**
     * Check if a multi-line commit message has a new line between the first and third lines.
     * e.g.
     *
     *  """
     *  [J#PROJ-123][BUG] Fix some bug
     *
     *  This fixes a bug introduced in the previous sprint.
     *  """
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     *
     * @private
     */
    _hasNewLineBetweenSummaryAndDescription (commitMessage) {
        const lines = this._commitMessageParser.getLines(commitMessage);
        const secondLine = lines[1];

        // The second line could either be empty, or contain a single new-line character
        return secondLine === '' || secondLine.trim() === '\n';
    }
};
