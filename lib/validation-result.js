'use strict';

module.exports = class ValidationResult {

    /**
     * @param {string} commitMessage
     * @param {Array<string>} failures
     */
    constructor (commitMessage, failures) {

        /**
         * @type {string}
         */
        this.commitMessage = commitMessage;

        /**
         * @type {Array<string>}
         */
        this.failures = failures || [];
    }

    /**
     * @returns {boolean}
     */
    get isValid () {
        return this.failures.length === 0;
    }
};
