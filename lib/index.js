'use strict';

const childProcess = require('child_process');

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

    // Get the commit type from a commit message,
    // e.g. "[J#PROJ-123][BUG] Fixes some bug"
    // or "[BUG] Fixes some bug"
    // would match "BUG".
    getCommitType: new RegExp(
        `^(\\[.#[A-Z0-9\-]+\\])?\\[(${COMMIT_TYPES.join('|')})\\]`
    ),

    mergeCommit: new RegExp(`^Merge (branch|pull request) .+$`)
};

/**
 * Return the lines of a commit message as an array.
 *
 * @param {string} commitMessage
 *
 * @returns {Array<string>}
 */
function getLines (commitMessage) {
    return commitMessage.split('\n');
}

/**
 * Check if a commit message is a single-line, i.e. there is no description.
 *
 * @param {string} commitMessage
 *
 * @returns {boolean}
 */
function isSingleLineCommitMessage (commitMessage) {
    const lines = getLines(commitMessage);

    return lines.length === 1;
}

/**
 * Check if a commit is a merge commit.
 *
 * @param {string} commitMessage
 *
 * @returns {boolean}
 */
function isMergeCommit (commitMessage) {
    const firstLine = getLines(commitMessage)[0];

    return REGEXS.mergeCommit.test(firstLine);
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
 */
function hasNewLineBetweenMessageAndDescription (commitMessage) {
    const lines = getLines(commitMessage);
    const secondLine = lines[1];

    // The second line could either be empty, or contain a single new-line character
    return secondLine === '' || secondLine.trim() === '\n';
}

/**
 * Check that the first line of a commit message is in the correct format.
 *
 * @param {string} commitMessage
 *
 * @returns {boolean}
 */
function isFirstLineValid (commitMessage) {
    const lines = getLines(commitMessage);
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
 * Get the commit type from a commit message.
 *
 * @param {string} commitMessage
 *
 * @returns {string|undefined} The commit type (e.g. "BUG"), or undefined if not found
 */
function getCommitType (commitMessage) {
    const lines = getLines(commitMessage);
    const firstLine = lines[0];

    const matches = firstLine.match(REGEXS.getCommitType);
    const commitTypeIndex = 2;

    if (!matches) {
        return undefined;
    }

    return matches[commitTypeIndex];
}

/**
 * Check if a single-line commit message is valid.
 *
 * @param {string} commitMessage
 *
 * @returns {{isValid: boolean, failures: Array<string>}}
 */
function validateSingleLineCommitMessage (commitMessage) {
    const result = {
        isValid: true,
        failures: []
    };

    // If the commit is a merge commit, don't do any further validation and just exit early
    if (isMergeCommit(commitMessage)) {
        return result;
    }

    if (!isFirstLineValid(commitMessage)) {
        result.failures.push(FAILURE_REASONS.firstLineInvalidFormat);
    }

    if (!getCommitType(commitMessage)) {
        result.failures.push(FAILURE_REASONS.missingOrInvalidCommitType);
    }

    result.isValid = result.failures.length === 0;

    return result;
}

/**
 * Check if a multi-line commit message is valid.
 *
 * @param {string} commitMessage
 *
 * @returns {{isValid: boolean, failures: Array<string>}}
 */
function validateMultiLineCommitMessage (commitMessage) {
    const result = validateSingleLineCommitMessage(commitMessage);

    if (!hasNewLineBetweenMessageAndDescription(commitMessage)) {
        result.failures.push(FAILURE_REASONS.noNewLineAfterFirstLine);
    }

    result.isValid = result.failures.length === 0;

    return result;
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
 * @returns {{isValid: boolean, failures: Array<string>}}
 */
function validateCommitMessage (commitMessage) {
    if (isSingleLineCommitMessage(commitMessage)) {
        return validateSingleLineCommitMessage(commitMessage);
    } else {
        return validateMultiLineCommitMessage(commitMessage);
    }
}

/**
 * Get the full, raw commit message from a given commit SHA.
 *
 * @param {string} sha
 *
 * @returns {Promise<string>}
 */
function getCommitMessageFromSHA (sha) {
    return new Promise((resolve, reject) => {
        childProcess.exec(`git log -1 --pretty=format:%B ${sha}`, (error, stdout) => {
            if (error) {
                console.error(`Failed to get commit message: ${error}`)
                reject(error);
                return;
            }

            resolve(stdout);
        });
    });
}

/**
 * Get the full, raw commit messages from a given set of commit SHAs.
 *
 * @param {Array<string>} shas
 *
 * @returns {Promise<Array<string>>}
 */
function getCommitMessagesFromSHAs (shas) {
    return Promise.all(shas.map(sha => getCommitMessageFromSHA(sha)));
}

/**
 * Get commit messages for all commits in the specified range.
 *
 * @param {string} range
 *
 * @returns {Promise<Array<string>>}
 */
function getCommitMessagesFromSHARange (range) {
    return new Promise((resolve, reject) => {
        getCommitSHAsInRange(range)
            .then(shas => getCommitMessagesFromSHAs(shas))
            .then(commitMessages => resolve(commitMessages))
            .catch(error => reject(error));
    });
}

/**
 * Get all commit SHAs in the specified range.
 *
 * @param {String} range - The range of git commits SHAs, e.g. "61335fd..dfg74yt"
 *
 * @returns {Promise<Array<string>>}
 */
function getCommitSHAsInRange (range) {
    return new Promise((resolve, reject) => {
        childProcess.exec(`git log --pretty=format%H ${range}`, (error, stdout) => {
            if (error) {
                console.error(`Failed to get commit SHAs: ${error}`);
                reject(error);
                return;
            }

            const shas = stdout.split(os.EOL);

            resolve(shas);
        });
    });
}

/**
 * Check if a commit message is valid.
 *
 * @param {string} commitMessage
 *
 * @returns {boolean} Returns true if commit message is valid, or false if not
 */
function isValidCommitMessage (commitMessage) {
    return validateCommitMessage(commitMessage).isValid === true;
}

module.exports = {
    validateCommitMessage: validateCommitMessage,

    getCommitMessageFromSHA: getCommitMessageFromSHA,

    getCommitMessagesFromSHAs: getCommitMessagesFromSHAs,

    getCommitMessagesFromSHARange: getCommitMessagesFromSHARange,

    isValidCommitMessage: isValidCommitMessage
};
