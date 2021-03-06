'use strict';

const COMMIT_TYPES = require('../commit-types').COMMIT_TYPES;

// Get the commit type from a commit message, e.g. "[J#PROJ-123][BUG] Fixes some bug"
// or "[BUG] Fixes some bug" would match "BUG".
const COMMIT_TYPE_REGEX = new RegExp(`^(\\[.#[A-Z0-9\-]+\\])?\\[(${COMMIT_TYPES.join('|')})\\]`);

// Check if a commit is a merge commit
const MERGE_COMMIT_REGEX = new RegExp(`^Merge .+$`);

// Check if a commit is a revert commit
const REVERT_COMMIT_REGEX = /^Revert ".+"$/;

module.exports = class CommitMessageParser {

    /**
     * Check if a commit message is a single line commit message (i.e. only a summary).
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     */
    isSingleLineCommitMessage (commitMessage) {
        return this.getLines(commitMessage).length === 1;
    }

    /**
     * @param {string} commitMessage
     *
     * @returns {string|undefined}
     */
    getCommitType (commitMessage) {
        const summary = this.getSummary(commitMessage);
        const matches = summary.match(COMMIT_TYPE_REGEX);
        const commitTypeIndex = 2;

        if (!matches) {
            return undefined;
        }

        return matches[commitTypeIndex];
    }

    /**
     * Get the first line (the summary) of a commit message.
     *
     * @param {string} commitMessage
     *
     * @returns {string}
     */
    getSummary (commitMessage) {
        const lines = this.getLines(commitMessage);

        return lines[0];
    }

    /**
     * Get the lines of a commit message, split into an array.
     *
     * @param {string} commitMessage
     *
     * @returns {Array<string>}
     */
    getLines (commitMessage) {
        return commitMessage.split('\n');
    }

    /**
     * Check if a commit message is a merge commit.
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     */
    isMergeCommit (commitMessage) {
        const summary = this.getSummary(commitMessage);

        return MERGE_COMMIT_REGEX.test(summary);
    }

    /**
     * Check if a commit message is a revert commit.
     *
     * @param {string} commitMessage
     *
     * @returns {boolean}
     */
    isRevertCommit (commitMessage) {
        const summary = this.getSummary(commitMessage);

        return REVERT_COMMIT_REGEX.test(summary);
    }
};
