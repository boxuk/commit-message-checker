'use strict';

const ValidationResult = require('./validation-result');
const FAILURE_REASONS = require('./failure-reasons').FAILURE_REASONS;
const COMMIT_TYPES = require('./commit-types').COMMIT_TYPES;

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
    ),

    mergeCommit: new RegExp(`^Merge .+$`),

    // Get the commit type from a commit message,
    // e.g. "[J#PROJ-123][BUG] Fixes some bug"
    // or "[BUG] Fixes some bug"
    // would match "BUG".
    getCommitType: new RegExp(
        `^(\\[.#[A-Z0-9\-]+\\])?\\[(${COMMIT_TYPES.join('|')})\\]`
    )
};

module.exports = class Validator {

    /**
     * @param {GitHelper} gitHelper
     */
    constructor (gitHelper) {

        /**
         * @type {GitHelper}
         * @private
         */
        this._gitHelper = gitHelper;
    }

    /**
     * Check if a commit message is in a valid format.
     *
     * Single and multi-line commit messages are supported.
     *
     * The first line of the commit should:
     *  - Optionally start with the ticket type and number (e.g. "[J#PROB-123]")
     *  - Always contain a commit type (e.g. "[CONFIG]", "[FEATURE]", etc.)
     *  - Contain a space after the commit type, followed by
     *  - Some text explaining the change
     *
     * For multi-line messages, the same rules apply for the first line, however the second
     * line should be an empty new-line that separates the commit message and more verbose
     * commit description.
     *
     * @param {string} commitMessage
     *
     * @returns {ValidationResult}
     */
    validateCommitMessage (commitMessage) {
        if (this._isSingleLineCommitMessage(commitMessage)) {
            return this._validateSingleLineCommitMessage(commitMessage);
        } else {
            return this._validateMultiLineCommitMessage(commitMessage);
        }
    }

    /**
     * Validate a set of commit messages.
     *
     * @param {Array<string>} commitMessages
     *
     * @returns {Array<ValidationResult>}
     */
    validateCommitMessages (commitMessages) {
        return commitMessages.map(commitMessage => this.validateCommitMessage(commitMessage));
    }

    /**
     * Validate a commit message for a given SHA.
     *
     * This will retrieve the commit message for the given SHA, validate it, and then return the result.
     *
     * @param {string} commitSHA
     *
     * @returns {Promise<ValidationResult>}
     */
    validateCommitMessageFromSHA (commitSHA) {
        return this._gitHelper.getCommitMessageFromSHA(commitSHA)
            .then(commitMessage => this.validateCommitMessage(commitMessage));
    }

    /**
     * Validate a set of commit messages that correspond to the provided set of commit SHAs.
     *
     * This will retrieve the commit messages from the set of SHAs, validate them, and then return an array of results.
     *
     * Note that if one or more of the provided SHAs are invalid, then this will reject and none of the validation
     * results will be accessible.
     *
     * @param {Array<string>} commitSHAs
     *
     * @returns {Promise<Array<ValidationResult>>}
     */
    validateCommitMessagesFromSHAs (commitSHAs) {
        return Promise.all(commitSHAs.map(commitSHA => this.validateCommitMessageFromSHA(commitSHA)));
    }

    /**
     * Validate the commit messages for the set of commits specified by the provided SHA range (e.g. aab243..42342d).
     *
     * This will retrieve the commit messages for the set of commits in the range, validate them, and then return
     * and array of results.
     *
     * Note that if the commit range is invalid, or if any of the commits SHAs in the range are invaid or inaccessible,
     * then this will reject and none of the validation results will be accessible.
     *
     * @param {string} commitRange
     *
     * @returns {Promise<Array<ValidationResult>>}
     */
    validateCommitMessagesFromSHARange (commitRange) {
        return this._gitHelper.getCommitMessagesFromSHARange(commitRange)
            .then(commitMessages => commitMessages.map(commitMessage => this.validateCommitMessage(commitMessage)));
    }

    /**
     * Check if a commit message is valid.
     *
     * @param {string} commitMessage
     *
     * @returns {boolean} Returns true if commit message is valid, or false if not
     */
    isValidCommitMessage (commitMessage) {
        return this.validateCommitMessage(commitMessage).isValid === true;
    }

    /**
     * Check if a single-line commit message is valid.
     *
     * @param {string} commitMessage
     *
     * @returns {ValidationResult}
     *
     * @private
     */
    _validateSingleLineCommitMessage (commitMessage) {
        const failures = [];

        // If the commit is a merge commit, don't do any further validation and just exit early
        if (this._isMergeCommit(commitMessage)) {
            return new ValidationResult(commitMessage);
        }

        if (!this._isFirstLineValid(commitMessage)) {
            failures.push(FAILURE_REASONS.firstLineInvalidFormat);
        }

        if (!this._getCommitType(commitMessage)) {
            failures.push(FAILURE_REASONS.missingOrInvalidCommitType);
        }

        return new ValidationResult(commitMessage, failures);
    }

    /**
     * Check if a multi-line commit message is valid.
     *
     * @param {string} commitMessage
     *
     * @returns {ValidationResult}
     *
     * @private
     */
    _validateMultiLineCommitMessage (commitMessage) {
        const result = this._validateSingleLineCommitMessage(commitMessage);

        if (!this._hasNewLineBetweenMessageAndDescription(commitMessage)) {
            result.failures.push(FAILURE_REASONS.noNewLineAfterFirstLine);
        }

        return result;
    }

    /**
     * Get the commit type from a commit message.
     *
     * @param {string} commitMessage
     *
     * @returns {string|undefined} The commit type (e.g. "BUG"), or undefined if not found
     *
     * @private
     */
    _getCommitType (commitMessage) {
        const lines = this._getLines(commitMessage);
        const firstLine = lines[0];

        const matches = firstLine.match(REGEXS.getCommitType);
        const commitTypeIndex = 2;

        if (!matches) {
            return undefined;
        }

        return matches[commitTypeIndex];
    }

    /**
     * Check that the first line of a commit message is in the correct format.
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     *
     * @private
     */
    _isFirstLineValid (commitMessage) {
        const lines = this._getLines(commitMessage);
        const firstLine = lines[0];

        // We allow commit messages that either contain:
        // - Ticket type, ticket number, commit type, and commit message, or:
        // - Commit type, and commit message

        return Boolean(
            REGEXS.ticketNumberWithCommitTypeAndMessage.test(firstLine) ||
            REGEXS.noTicketNumberWithCommitTypeAndMessage.test(firstLine)
        );
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
    _hasNewLineBetweenMessageAndDescription (commitMessage) {
        const lines = this._getLines(commitMessage);
        const secondLine = lines[1];

        // The second line could either be empty, or contain a single new-line character
        return secondLine === '' || secondLine.trim() === '\n';
    }

    /**
     * Check if a commit is a merge commit.
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     *
     * @private
     */
    _isMergeCommit (commitMessage) {
        const firstLine = this._getLines(commitMessage)[0];

        return REGEXS.mergeCommit.test(firstLine);
    }

    /**
     * Check if a commit message is a single-line, i.e. there is no description.
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     *
     * @private
     */
    _isSingleLineCommitMessage (commitMessage) {
        const lines = this._getLines(commitMessage);

        return lines.length === 1;
    }

    /**
     * Return the lines of a commit message as an array.
     *
     * @param {string} commitMessage
     *
     * @returns {Array<string>}
     */
    _getLines (commitMessage) {
        return commitMessage.split('\n');
    }
};
