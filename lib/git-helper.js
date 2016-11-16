'use strict';

const os = require('os');
const childProcess = require('child_process');


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
                console.error(`Failed to get commit message: ${error}`);
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
 * Get all commit SHAs in the specified range.
 *
 * @param {String} range - The range of git commits SHAs, e.g. "61335fd..dfg74yt"
 *
 * @returns {Promise<Array<string>>}
 */
function getCommitSHAsInRange (range) {
    return new Promise((resolve, reject) => {
        childProcess.exec(`git log --pretty=format:%H ${range}`, (error, stdout) => {
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

module.exports = {
    getCommitSHAsInRange: getCommitSHAsInRange,
    getCommitMessagesFromSHAs: getCommitMessagesFromSHAs,
    getCommitMessagesFromSHARange: getCommitMessagesFromSHARange,
    getCommitMessageFromSHA: getCommitMessageFromSHA
};
