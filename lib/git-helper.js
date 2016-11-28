'use strict';

module.exports = class GitHelper {

    /**
     * @param {Function} exec
     */
    constructor (exec) {

        /**
         * @type {Function}
         * @private
         */
        this._exec = exec;
    }

    /**
     * Get the full, raw commit message from a given commit SHA.
     *
     * @param {string} sha
     *
     * @returns {Promise<string>}
     */
    getCommitMessageFromSHA (sha) {
        return new Promise((resolve, reject) => {
            this._exec(`git log -1 --pretty=format:%B ${sha}`, (error, stdout) => {
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
    getCommitMessagesFromSHAs (shas) {
        return Promise.all(shas.map(sha => this.getCommitMessageFromSHA(sha)));
    }

    /**
     * Get all commit SHAs in the specified commit range.
     *
     * @param {String} commitRange - The range of git commits SHAs, e.g. "61335fd..dfg74yt"
     *
     * @returns {Promise<Array<string>>}
     */
    getCommitSHAsInRange (commitRange) {
        return new Promise((resolve, reject) => {
            this._exec(`git log --pretty=format:%H ${commitRange}`, (error, stdout) => {
                if (error) {
                    console.error(`Failed to get commit SHAs: ${error}`);
                    reject(error);

                    return;
                }

                const shas = stdout.split('\n');

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
    getCommitMessagesFromSHARange (commitRange) {
        return new Promise((resolve, reject) => {
            this.getCommitSHAsInRange(commitRange)
                .then(shas => this.getCommitMessagesFromSHAs(shas))
                .then(commitMessages => resolve(commitMessages))
                .catch(error => reject(error));
        });
    }
};
