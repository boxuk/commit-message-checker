#!/usr/bin/env node

'use strict';

const lib = require('../lib');
const reporter = require('../reporter').resultFormatter;

const isPullRequest = process.env.TRAVIS_PULL_REQUEST !== 'false';

if (!isPullRequest) {
    console.log('Not checking commit message as this is not a pull-request build');

    return;
}

const commitSHAs = process.env.TRAVIS_COMMIT_RANGE;

lib.getCommitMessagesFromSHARange(commitSHAs)
    .catch(error => {
        // If we failed to get the commit messages then fail the build
        throw new Error(`Failed to retrieve commit messages: ${error}`);
    })
    .then(commitMessages => {
        const results = commitMessages.map(commitMessage => ({
            validation: lib.validateCommitMessage(commitMessage),
            commitMessage: commitMessage
        }));

        const failures = results.filter(result => result.validation.isValid === false);

        console.log(`Tested ${commitMessages.length} commit messages, ${failures.length} were invalid`);

        // If any of the commit message are invalid, output some helpful information and then exit with non-zero code
        if (failures) {
            failures.map(failure => console.error(reporter(failure.commitMessage, failure.validation)));
            throw new Error(`${failures.length} commit messages are in an invalid format`);
        }
    });
