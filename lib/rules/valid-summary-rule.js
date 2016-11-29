'use strict';

// TODO: This rule should be replaced with more granular rules.

const COMMIT_TYPES = require('../commit-types').COMMIT_TYPES;
const ValidationResult = require('../validation-result');

const REGEXS = {
    // Ticket number, commit type, and message
    // e.g. "[J#PROJ-123][BUG] A short message"
    ticketNumberWithCommitTypeAndMessage: new RegExp(
        `^\\[[A-Z]#[A-Za-z0-9]+\-\\d+\\]\\[(${COMMIT_TYPES.join('|')})\\] .+$`
    ),

    // Commit type and message, but without the ticket number
    // e.g. "[BUG] Fix issue"
    noTicketNumberWithCommitTypeAndMessage: new RegExp(
        `^\\[(${COMMIT_TYPES.join('|')})\\] .+$`
    )
};

module.exports = class ValidSummaryRule {

    /**
     * @param {CommitMessageParser} commitMessageParser
     */
    constructor (commitMessageParser) {

        /**
         * @type {string}
         */
        this.type = 'FIRST_LINE_INVALID_FORMAT';

        /**
         * @type {CommitMessageParser}
         * @private
         */
        this._commitMessageParser = commitMessageParser;
    }

    /**
     * Check that the first-line of the commit message (the summary) is in a valid format.
     *
     * @param {string} commitMessage
     *
     * @returns {ValidationResult}
     */
    validate (commitMessage) {
        const summary = this._commitMessageParser.getSummary(commitMessage);

        // We allow commit messages that either contain:
        // - Ticket type, ticket number, commit type, and commit message, or:
        // - Commit type, and commit message

        const isValid = Boolean(
            REGEXS.ticketNumberWithCommitTypeAndMessage.test(summary) ||
            REGEXS.noTicketNumberWithCommitTypeAndMessage.test(summary)
        );

        if (isValid) {
            return new ValidationResult(commitMessage);
        }

        return new ValidationResult(commitMessage, [this.type]);
    }
};
