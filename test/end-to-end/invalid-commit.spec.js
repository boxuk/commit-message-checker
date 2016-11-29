'use strict';

const chai = require('chai');

const expect = chai.expect;

const library = require('../../lib');
const failureReasons = require('../../lib/failure-reasons').FAILURE_REASONS;

describe('checking invalid commit messages', () => {
    it('should treat "Test commit" as an invalid commit message, due to lack of commit type', () => {
        expect(library.isValidCommitMessage('Test commit')).to.be.false;

        expect(library.validateCommitMessage('Test commit').failures)
            .to.contain(failureReasons.missingOrInvalidCommitType);
    });

    it('should treat a multi-line message as invalid if there is no new line between summary and description', () => {
        const commitMessage = '[BUG] Some bug fix\nFix issue with some feature';

        expect(library.isValidCommitMessage(commitMessage)).to.be.false;

        expect(library.validateCommitMessage(commitMessage).failures)
            .to.contain(failureReasons.noNewLineAfterFirstLine);
    });
});
