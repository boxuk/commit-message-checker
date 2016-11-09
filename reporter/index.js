'use strict';

const FAILURE_EXPLANATIONS = require('../lib/failure-reasons').EXPLANATIONS;

/**
 * @param {string} commitMessage
 * @param {{isValid: boolean, failures: Array<string>}} commitMessageCheckResult
 *
 * @returns {string|undefined}
 */
function resultFormatter (commitMessage, commitMessageCheckResult) {
    // If the commit message is valid then just return as we have nothing to show
    if (commitMessageCheckResult.isValid) {
        return;
    }

    const output = `========================

        The following commit message failed validation. The reasons why it failed ` +
        `are shown below the commit message.

        """
        ${commitMessage}
        """

        Failure reasons:
        ================

        `;

    for (const failure of commitMessageCheckResult.failures) {
        const explanation = FAILURE_EXPLANATIONS[failure];

        output.push(`- "${failure}": ${explanation}`);
    }

    return output;
}

exports.resultFormatter = resultFormatter;
