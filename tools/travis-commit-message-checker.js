#!/usr/bin/env node

'use strict';

const lib = require('../lib');
const reporter = require('../reporter').resultFormatter;

const isPullRequest = process.env.TRAVIS_PULL_REQUEST !== 'false';

if (isPullRequest) {
    const commitRange = process.env.TRAVIS_COMMIT_RANGE;

    lib.validateCommitMessagesFromSHARange(commitRange)
        .catch(error => {
            // If we failed to get the commit messages then fail the build
            console.error(`Failed to retrieve commit messages: ${error}`);

            process.exit(1);
        })
        .then(validationResults => {
            const failures = validationResults.filter(result => result.isValid === false);

            console.log(`Tested ${validationResults.length} commit messages, ${failures.length} were invalid`);

            // If any of the commit message are invalid, output some helpful information and then
            // exit with non-zero code
            if (failures.length) {
                for (const failure of failures) {
                    console.error(reporter(failure));
                }

                console.error(`${failures.length} commit messages are in an invalid format`);

                console.error(
                    'See https://github.com/boxuk/commit-message-checker/blob/master/README.md for more ' +
                    'details on failure reasons'
                );

                process.exit(1);
            }
        });
} else {
    // This is a "push" build (i.e. a commit has been pushed to a branch), so test only the latest commit
    const commitSHA = process.env.TRAVIS_COMMIT;

    lib.validateCommitMessageFromSHA(commitSHA)
        .catch(error => {
            // If we failed to get the commit message then fail the build
            console.error(`Failed to retrieve commit message: ${error}`);

            process.exit(1);
        })
        .then(validationResult => {
            if (!validationResult.isValid) {
                // The commit message was invalid, so output some helpful information and then exit with non-zero code
                console.error(reporter(validationResult));

                console.error(
                    'See https://github.com/boxuk/commit-message-checker/blob/master/README.md for more ' +
                    'details on failure reasons'
                );

                process.exit(1);
            }
        });
}
