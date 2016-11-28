'use strict';

const FAILURE_EXPLANATIONS = require('../lib/failure-reasons').EXPLANATIONS;

/**
 * @param {ValidationResult} validationResult
 *
 * @returns {string}
 */
function resultFormatter (validationResult) {
    // If the commit message is valid then just return as we have nothing to show
    if (validationResult.isValid) {
        return '';
    }

    let output = `========================

The following commit message failed validation. The reasons why it failed ` +
`are shown below the commit message.

"""
${validationResult.commitMessage}
"""

Failure reasons:
================
        `;

    for (const failure of validationResult.failures) {
        const explanation = FAILURE_EXPLANATIONS[failure];

        output = output += `\n- "${failure}": ${explanation}\n`;
    }

    return output;
}

exports.resultFormatter = resultFormatter;
