'use strict';

const ValidationResult = require('./validation-result');

module.exports = class Validator {

    /**
     * @param {GitHelper} gitHelper
     * @param {CommitMessageParser} commitMessageParser
     * @param {Array<{validate: ValidationResult}>} rules
     */
    constructor (gitHelper, commitMessageParser, rules) {

        /**
         * @type {GitHelper}
         * @private
         */
        this._gitHelper = gitHelper;

        /**
         * @type {CommitMessageParser}
         * @private
         */
        this._commitMessageParser = commitMessageParser;

        /**
         * @type {Array<{validate: ValidationResult}>}
         * @private
         */
        this._rules = rules || [];
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
        // If this is a merge commit, just consider it valid.
        // Otherwise, run the commit message through all configured rules.
        if (this._commitMessageParser.isMergeCommit(commitMessage)) {
            return new ValidationResult(commitMessage);
        }

        let validationFailureReasons = [];

        for (const rule of this._rules) {
            const validationResult = rule.validate(commitMessage);

            if (!validationResult.isValid) {
                validationFailureReasons = validationFailureReasons.concat(validationResult.failures);
            }
        }

        return new ValidationResult(commitMessage, validationFailureReasons);
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
};
