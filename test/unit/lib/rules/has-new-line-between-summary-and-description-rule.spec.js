'use strict';

const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

const expect = chai.expect;

const HasNewLineBetweenSummaryAndDescriptionRule = require(
    '../../../../lib/rules/has-new-line-between-summary-and-description-rule'
);

describe('Rules: HasNewLineBetweenSummaryAndDescriptionRule', () => {
    let hasNewLineBetweenSummaryAndDescriptionRule;

    beforeEach(() => {
        hasNewLineBetweenSummaryAndDescriptionRule = new HasNewLineBetweenSummaryAndDescriptionRule();
    });

    describe('single-line commit messages', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = 'Fix issue with foo';
            validationResult = hasNewLineBetweenSummaryAndDescriptionRule.validate(commitMessage);
        });

        it('should be marked as valid', () => {
            expect(validationResult.isValid).to.be.true;
        });

        it('should not have any failures', () => {
            expect(validationResult.failures).to.be.empty;
        });
    });

    describe('multi-line commit message without empty new-line between summary and description', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = 'Summary\nDescription';
            validationResult = hasNewLineBetweenSummaryAndDescriptionRule.validate(commitMessage);
        });

        it('should be marked as invalid', () => {
            expect(validationResult.isValid).to.be.false;
        });

        it('should only have 1 failure reason', () => {
            expect(validationResult.failures.length).to.equal(1);
        });

        it('should have the correct failure reason', () => {
            expect(validationResult.failures[0]).to.equal(hasNewLineBetweenSummaryAndDescriptionRule.type);
        });
    });

    describe('multi-line commit message with an empty new-line between summary and description', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = 'Summary\n\nDescription';
            validationResult = hasNewLineBetweenSummaryAndDescriptionRule.validate(commitMessage);
        });

        it('should be marked as valid', () => {
            expect(validationResult.isValid).to.be.true;
        });

        it('should not have any failures', () => {
            expect(validationResult.failures).to.be.empty;
        });
    });
});
