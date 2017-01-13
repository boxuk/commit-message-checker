#!/usr/bin/env node

'use strict';

const lib = require('../lib');
const config = require('../lib/config');
const reporter = require('../reporter').table;

const isPullRequest = process.env.TRAVIS_PULL_REQUEST !== 'false';

if (isPullRequest) {
    const pullRequestBranch = process.env.TRAVIS_PULL_REQUEST_BRANCH;
    const commitRange = process.env.TRAVIS_COMMIT_RANGE;

    // Check if we should ignore pull requests from this branch
    if (config.ignorePullRequestsFromBranches.indexOf(pullRequestBranch) !== -1) {
        console.info('Not checking commit messages as pull requests from this branch are set to be ignored');
        return;
    }

    lib.validateCommitMessagesFromSHARange(commitRange)
        .catch(error => {
            // If we failed to get the commit messages then fail the build
            console.error(`Failed to retrieve commit messages: ${error}`);

            process.exit(1);
        })
        .then(validationResults => {
            const failures = validationResults.filter(result => result.isValid === false);

            // If any of the commit message are invalid, output some helpful information and then
            // exit with non-zero code
            if (failures.length) {
                reporter(failures);

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
                reporter([validationResult]);

                process.exit(1);
            }
        });
}
