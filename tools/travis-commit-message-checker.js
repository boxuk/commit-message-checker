#!/usr/bin/env node

'use strict';

const lib = require('../lib');
const reporter = require('../reporter').resultFormatter;

// TODO: For PR build we should check all commits in the pull-request, not just the latest one.
//       This is more problematic than it sounds (though not impossible), and should be addressed seperately.

// Currently we only test PR builds, where we get the HEAD commit.

const isPullRequest = process.env['TRAVIS_PULL_REQUEST'] === 'true';

if (!isPullRequest) {
    console.log('Not checking commit message as this is not a pull-request build');
    return;
}

// Note that we can't use "TRAVIS_COMMIT" here as we'll get a merge commit
const commitSHA = process.env['TRAVIS_PULL_REQUEST_SHA'];

lib.getCommitMessageFromSHA(commitSHA)
    .catch(error => {
        // If we failed to get the commit message then fail the build
        console.error('Failed to retrieve commit message');
        return process.exit(1);
    })
    .then(commitMessage => {
        const validation = lib.validateCommitMessage(commitMessage);

        // If the commit message is invalid, output some helpful information and then exit with non-zero code
        if (!validation.isValid) {
            console.error(reporter(commitMessage, validation));
            process.exit(1);
        }
    });
