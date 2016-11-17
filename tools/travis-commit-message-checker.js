#!/usr/bin/env node

'use strict';

const lib = require('../lib');
const reporter = require('../reporter').resultFormatter;

const isPullRequest = process.env.TRAVIS_PULL_REQUEST !== 'false';

if (isPullRequest) {
    const commitSHAs = process.env.TRAVIS_COMMIT_RANGE;

    lib.getCommitMessagesFromSHARange(commitSHAs)
        .catch(error => {
            // If we failed to get the commit messages then fail the build
            console.error(`Failed to retrieve commit messages: ${error}`);

            process.exit(1);
        })
        .then(commitMessages => {
            const results = commitMessages.map(commitMessage => ({
                validation: lib.validateCommitMessage(commitMessage),
                commitMessage: commitMessage
            }));

            const failures = results.filter(result => result.validation.isValid === false);

            console.log(`Tested ${commitMessages.length} commit messages, ${failures.length} were invalid`);

            // If any of the commit message are invalid, output some helpful information and
            // then exit with non-zero code
            if (failures.length) {
                failures.map(failure => console.error(reporter(failure.commitMessage, failure.validation)));

                console.error(`${failures.length} commit messages are in an invalid format`);

                process.exit(1);
            }
        });
} else {
    // This is a "push" build (i.e. a commit has been pushed to a branch), so test only the latest commit
    const commitSHA = process.env.TRAVIS_COMMIT;

    lib.getCommitMessageFromSHA(commitSHA)
        .catch(error => {
            // If we failed to get the commit message then fail the build
            console.error(`Failed to retrieve commit message: ${error}`);

            process.exit(1);
        })
        .then(commitMessage => {
            const validation = lib.validateCommitMessage(commitMessage);

            if (!validation.isValid) {
                // The commit message was invalid, so output some helpful information and then exit with non-zero code
                console.error(reporter(commitMessage, validation));

                process.exit(1);
            }
        });
}
