'use strict';

const chalk = require('chalk');
const table = require('table').table;

const FAILURE_EXPLANATIONS = require('../lib/failure-reasons').EXPLANATIONS;

/**
 * Build a table of validation failures and reasons.
 *
 * @param {ValidationResult} validationResult
 *
 * @returns {string}
 */
function buildTable (validationResult) {
    const rows = [];

    if (validationResult.isValid) {
        // For valid commit messages we have nothing to show
        return '';
    }

    rows.push([
        chalk.bold('Rule ID'),
        chalk.bold('Message')
    ]);

    for (const failure of validationResult.failures) {
        const explanation = FAILURE_EXPLANATIONS[failure] || 'Unknown error';

        rows.push([
            failure,
            explanation
        ]);
    }

    return table(rows, {
        drawHorizontalLine (index) {
            // Draw a horizontal line before the second line (i.e. below the header)
            return index === 1;
        },

        columns: {
            1: {
                wrapWord: true,
                width: 60
            },

            0: {
                wrapWord: true,
                width: 30
            }
        }
    });
}

/**
 * @param {Array<ValidationResult>} validationResults
 *
 * @returns {string}
 */
function buildReport (validationResults) {
    let output = '';

    for (const validationResult of validationResults) {
        if (!validationResult.isValid) {
            output += chalk.bold.underline.red('\nThe following commit message failed validation:\n\n');
            output += chalk.white.bold(`${validationResult.commitMessage}\n\n${buildTable(validationResult)}`);
        }
    }

    return output;
}

module.exports = function reporter (validationResults) {
    const failures = validationResults.filter(validationResult => !validationResult.isValid);

    if (!failures.length) {
        return;
    }

    const report = buildReport(validationResults);

    console.log(report);
    console.log(
        '\nSee https://github.com/boxuk/commit-message-checker/blob/master/README.md for more ' +
        'details on failure reasons\n\n'
    );
};
