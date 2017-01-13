#!/usr/bin/env node

'use strict';

const lib = require('../lib');
const config = require('../lib/config');
const reporter = require('../reporter').table;

const isPullRequest = Boolean(process.env.APPVEYOR_PULL_REQUEST_NUMBER);

if (isPullRequest) {
    const baseBranch = process.env.APPVEYOR_REPO_BRANCH;

    // TODO: get pull request branch, not exposed through app veyor env vars
    const exec = require('child_process').exec;

    // Get SHA of PR commit, which is 1 up from the HEAD (as HEAD will be a merge commit)
    exec('git rev-parse HEAD~1', (err, sha) => {
        // Get branches commit belongs to
        exec(`git branch --contains ${sha}`, (err, stdout) => {
            const branches = stdout.split('\n');

            console.info(branches);
        });
    });

    // For the commit range, we need to get all commits since the base branch, up to the current HEAD.
    const commitRange = `${baseBranch}..HEAD`;

    lib.validateCommitMessagesFromSHARange(commitRange)
        .catch(error => {
            // If we failed to get the commit messages then fail the build
            console.error(`Failed to retrieve commit messages: ${error}`);

            process.exit(1);
        })
        .then(results => {
            const failures = results.filter(result => result.isValid === false);

            // If any of the commit message are invalid, output some helpful information and then
            // exit with non-zero code
            if (failures.length) {
                reporter(failures);

                process.exit(1);
            }
        });
} else {
    // This is a branch build, so just check the latest commit that has been pushed to the branch

    const commitSHA = process.env.APPVEYOR_REPO_COMMIT;

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
