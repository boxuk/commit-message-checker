'use strict';

const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

const expect = chai.expect;

const ValidSummaryRule = require('../../../../lib/rules/valid-summary-rule');

describe('Rules: ValidSummaryRule', () => {
    let validSummaryRule;

    beforeEach(() => {
        validSummaryRule = new ValidSummaryRule();
    });

    describe('commit message: "Some commit message"', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = 'Some commit message';
            validationResult = validSummaryRule.validate(commitMessage);
        });

        it('should be marked as invalid', () => {
            expect(validationResult.isValid).to.be.false;
        });

        it('should only have 1 failure reason', () => {
            expect(validationResult.failures.length).to.equal(1);
        });

        it('should have the correct failure reason', () => {
            expect(validationResult.failures[0]).to.equal(validSummaryRule.type);
        });
    });

    describe('commit message: "[BUG] Fix issue with foo"', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = '[BUG] Fix issue with foo';
            validationResult = validSummaryRule.validate(commitMessage);
        });

        it('should be marked as valid', () => {
            expect(validationResult.isValid).to.be.true;
        });

        it('should not have any failures', () => {
            expect(validationResult.failures).to.be.empty;
        });
    });

    describe('commit message: "[J#PROJ-123][BUG] Fix issue with foo"', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = '[J#PROJ-123][BUG] Fix issue with foo';
            validationResult = validSummaryRule.validate(commitMessage);
        });

        it('should be marked as valid', () => {
            expect(validationResult.isValid).to.be.true;
        });

        it('should not have any failures', () => {
            expect(validationResult.failures).to.be.empty;
        });
    });

    describe('commit message: "[J#PROJ-123][BUG]Fix issue with foo"', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = '[J#PROJ-123][BUG]Fix issue with foo';
            validationResult = validSummaryRule.validate(commitMessage);
        });

        it('should be marked as invalid', () => {
            expect(validationResult.isValid).to.be.false;
        });

        it('should only have 1 failure reason', () => {
            expect(validationResult.failures.length).to.equal(1);
        });

        it('should have the correct failure reason', () => {
            expect(validationResult.failures[0]).to.equal(validSummaryRule.type);
        });
    });

    describe('commit message: "[J#PROJ-123] Fix issue with foo"', () => {
        let commitMessage;
        let validationResult;

        beforeEach(() => {
            commitMessage = '[J#PROJ-123] Fix issue with foo';
            validationResult = validSummaryRule.validate(commitMessage);
        });

        it('should be marked as invalid', () => {
            expect(validationResult.isValid).to.be.false;
        });

        it('should only have 1 failure reason', () => {
            expect(validationResult.failures.length).to.equal(1);
        });

        it('should have the correct failure reason', () => {
            expect(validationResult.failures[0]).to.equal(validSummaryRule.type);
        });
    });
});
