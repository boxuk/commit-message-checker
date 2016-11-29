'use strict';

const chai = require('chai');

const expect = chai.expect;

const COMMIT_TYPES = require('../../../../lib/commit-types').COMMIT_TYPES;
const CommitMessageParser = require('../../../../lib/commit-message-parser');
const HasValidCommitTypeRule = require('../../../../lib/rules/has-valid-commit-type-rule');

describe('Rules: HasValidCommitTypeRule', () => {
    let hasValidCommitTypeRule;

    beforeEach(() => {
        hasValidCommitTypeRule = new HasValidCommitTypeRule(new CommitMessageParser());
    });

    describe('a commit message without type', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = 'Some commit message';
            validationResult = hasValidCommitTypeRule.validate(commitMessage);
        });

        it('should be marked as invalid', () => {
            expect(validationResult.isValid).to.be.false;
        });

        it('should only have 1 failure reason', () => {
            expect(validationResult.failures.length).to.equal(1);
        });

        it('should have the correct failure reason', () => {
            expect(validationResult.failures[0]).to.equal(hasValidCommitTypeRule.type);
        });
    });

    describe('a commit message with an invalid type', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = '[FOO] Some commit message';
            validationResult = hasValidCommitTypeRule.validate(commitMessage);
        });

        it('should be marked as invalid', () => {
            expect(validationResult.isValid).to.be.false;
        });

        it('should only have 1 failure reason', () => {
            expect(validationResult.failures.length).to.equal(1);
        });

        it('should have the correct failure reason', () => {
            expect(validationResult.failures[0]).to.equal(hasValidCommitTypeRule.type);
        });
    });

    describe('commit messages with valid types', () => {
        for (const commitType of COMMIT_TYPES) {
            describe(`commit message: "[${commitType}] Fix issue with foo"`, () => {
                let commitMessage;
                let validationResult;

                beforeEach(() => {
                    commitMessage = `[${commitType}] Fix issue with foo`;
                    validationResult = hasValidCommitTypeRule.validate(commitMessage);
                });

                it('should be marked as valid', () => {
                    expect(validationResult.isValid).to.be.true;
                });

                it('should not have any failures', () => {
                    expect(validationResult.failures).to.be.empty;
                });
            });

            describe(`commit message: "[J#PROJ-987][${commitType}] Fix issue with foo"`, () => {
                let commitMessage;
                let validationResult;

                beforeEach(() => {
                    commitMessage = `[${commitType}] Fix issue with foo`;
                    validationResult = hasValidCommitTypeRule.validate(commitMessage);
                });

                it('should be marked as valid', () => {
                    expect(validationResult.isValid).to.be.true;
                });

                it('should not have any failures', () => {
                    expect(validationResult.failures).to.be.empty;
                });
            });
        }
    });
});
