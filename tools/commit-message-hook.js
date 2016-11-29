#!/usr/bin/env node

/**
 * @fileoverview
 *
 * A commit-msg hook that can be used for validating commit messages on the client-side.
 *
 * Note that if an invalid commit is detected then a report detailing the failures will be output, but the
 * commit will not be blocked.
 *
 * We want to limit impact on developer workflow as little as possible, and so by displaying reasons why the message
 * is invalid but also allowing the commit to happen, we put the onus on the developer to fix any failures prior to
 * pushing the commit to SCM (and triggering a CI build where the invalid commit message should fail the build).
 *
 * Usage:
 * ======
 *
 * Link this file to your git hooks directory within your repo.
 *
 * ln -s -f ../../node_modules/.bin/commit-message-hook .git/hooks/commit-msg
 */

'use strict';

const fs = require('fs');

const lib = require('../lib');
const reporter = require('../reporter').table;

// The path to the temporary file containing the commit message will be passed in as the first argument.
// process.argv will contain the following:
//  - 0: Path to node executable
//  - 1: Path to JS file being executed (this file)
//  - 2: First argument, in this case the file path of the commit message
const commitMessageFileLocation = process.argv[2];

fs.readFile(commitMessageFileLocation, (error, data) => {
    if (error) {
        throw new Error(error);
    }

    const commitMessage = data.toString();
    const validationResult = lib.validateCommitMessage(commitMessage);

    if (!validationResult.isValid) {
        // The commit message is invalid, so output report explaining why.
        // We could also exit with a non-0 code here, which would block the commit.
        reporter([validationResult]);
    }
});
