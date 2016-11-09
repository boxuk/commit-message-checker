'use strict';

const chai = require('chai');

const lib = require('../../index');
const VALID_COMMIT_TYPES = require('../../lib/commit-types').COMMIT_TYPES;
const FAILURE_REASONS = require('../../lib/failure-reasons').FAILURE_REASONS;
const isValidCommitMessage = lib.isValidCommitMessage;
const validateCommitMessage = lib.validateCommitMessage;

chai.should();

describe('checking that commit messages are valid', () => {
    const validCommitMessages = [
        `[J#PROJ-123][BUG] A short commit message

        A longer description of the change that may span
        several lines.
        `,

        `[J#PROJ-1][CONFIG] Another short commit message

        A longer description of the change.
        `,

        `[J#PROJ2-9][FEATURE] A single line commit message`,

        `[BUG] A bug-fix without a relevant ticket`
    ];

    for (const commitMessage of validCommitMessages) {
        it(
            `should treat this commit message as valid:

            """
            ${commitMessage}
            """
            `,
            () => {
                isValidCommitMessage(commitMessage).should.be.true;
            }
        );
    }

    it('should be invalid if missing all of the required data', () => {
        const commitMessage = 'A commit message without any of the required data';

        isValidCommitMessage(commitMessage).should.be.false;
    });

    it('should be invalid if the ticket type is specified, but the ticket number is omitted', () => {
        const commitMessage = '[J#][CONFIG] A commit message';

        isValidCommitMessage(commitMessage).should.be.false;
    });

    it('should be invalid if the commit type is omitted', () => {
        const commitMessage = '[J#PROJ-123] A commit message';

        isValidCommitMessage(commitMessage).should.be.false;
    });

    it('should be invalid if there is no new-line between the first line and commit description', () => {
        const commitMessage = `[J#ABC-123][FEATURE] Add foo FEATURE
        Add exploding unicorn feature
        `;

        isValidCommitMessage(commitMessage).should.be.false;
    });

    it('should report merge commits as valid', () => {
        isValidCommitMessage('Merge pull request #123 from boxuk/develop').should.be.true;
    });

    describe('checking for valid commit types', () => {
        for (const commitType of VALID_COMMIT_TYPES) {
            describe(`commit type: ${commitType}`, () => {
                const commitMessageWithTicket = `[J#PROJ-123][${commitType}] A short message`;
                const commitMessageWithoutTicket = `[${commitType}] A short message`;

                it(`should consider this a valid commit message: "${commitMessageWithTicket}"`, () => {
                    isValidCommitMessage(commitMessageWithTicket).should.be.true;
                });

                it(`should consider this a valid commit message: "${commitMessageWithoutTicket}"`, () => {
                    isValidCommitMessage(commitMessageWithoutTicket).should.be.true;
                });
            });
        }
    });

    describe('checking for invalid commit types', () => {
        const invalidTypeExamples = [
            'FIX',
            'PERF',
            'FEAT',
            'N/A'
        ];

        for (const commitType of invalidTypeExamples) {
            describe(`commit type: ${commitType}`, () => {
                const commitMessageWithTicket = `[J#PROJ-987][${commitType}] A bug fix`;
                const commitMessageWithoutTicket = `[${commitType}] A bug fix`;

                it(`should consider this an invalid commit message: "${commitMessageWithTicket}"`, () => {
                    isValidCommitMessage(commitMessageWithTicket).should.be.false;
                });

                it(`should consider this an invalid commit message: "${commitMessageWithoutTicket}"`, () => {
                    isValidCommitMessage(commitMessageWithoutTicket).should.be.false;
                });
            });
        }
    });
});

describe('reportig why commit messages are invalid', () => {
    describe('[J#PROJ-123][CHANGE] Some change', () => {
        let commitMessage;

        beforeEach(() => {
            commitMessage = '[J#PROJ-123][CHANGE] Some change';
        });

        it('should be marked as invalid', () => {
            const result = validateCommitMessage(commitMessage);

            result.isValid.should.be.false;
        });

        it('should fail due to having an invalid commit type', () => {
            const result = validateCommitMessage(commitMessage);

            result.failures.should.contain(FAILURE_REASONS.missingOrInvalidCommitType);
        });

        it('should fail due to the first line being in an invalid format', () => {
            const result = validateCommitMessage(commitMessage);

            result.failures.should.contain(FAILURE_REASONS.firstLineInvalidFormat);
        });
    });

    describe('Some commit message', () => {
        let commitMessage;

        beforeEach(() => {
            commitMessage = 'Some commit message';
        });

        it('should be marked as invalid', () => {
            const result = validateCommitMessage(commitMessage);

            result.isValid.should.be.false;
        });

        it('should fail due to omitting a commit type', () => {
            const result = validateCommitMessage(commitMessage);

            result.failures.should.contain(FAILURE_REASONS.missingOrInvalidCommitType);
        });

        it('should fail due to the first line being in an invalid format', () => {
            const result = validateCommitMessage(commitMessage);

            result.failures.should.contain(FAILURE_REASONS.firstLineInvalidFormat);
        });
    });

    describe('[J#PROJ-987][DOCS] Add documentation for foo', () => {
        let commitMessage;

        beforeEach(() => {
            commitMessage = '[J#PROJ-987][DOCS] Add documentation for foo';
        });

        it('should be marked as valid', () => {
            const result = validateCommitMessage(commitMessage);

            result.isValid.should.be.true;
        });

        it('should not have any failures', () => {
            const result = validateCommitMessage(commitMessage);

            result.failures.should.be.empty;
        });
    });

    describe('[J#PROJ-987][DOCS] Add documentation for foo\nSome commit description', () => {
        let commitMessage;

        beforeEach(() => {
            commitMessage = `[J#PROJ-987][DOCS] Add documentation for foo
                Some commit description`;
        });

        it('should be marked as invalid', () => {
            const result = validateCommitMessage(commitMessage);

            result.isValid.should.be.false;
        });

        it('should fail due to missing a new line between first and third lines', () => {
            const result = validateCommitMessage(commitMessage);

            result.failures.should.contain(FAILURE_REASONS.noNewLineAfterFirstLine);
        });
    });
});
