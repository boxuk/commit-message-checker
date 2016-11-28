'use strict';

const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

const expect = chai.expect;

const Validator = require('../../../lib/validator');

describe('validator', () => {
    describe('validating a commit message and checking for errors', () => {
        it('should correctly identify a valid commit message', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const validationResult = validator.validateCommitMessage('[J#PROJ-123][BUG] Fix issue with foo');

            expect(validationResult.isValid).to.be.true;
        });

        it('should return a validation result with no errors when the commit message is valid', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const validationResult = validator.validateCommitMessage('[J#PROJ-123][BUG] Fix issue with foo');

            expect(validationResult.isValid).to.be.true;
            expect(validationResult.failures).to.be.empty;
        });

        it('should correctly identify an invalid commit message', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const validationResult = validator.validateCommitMessage('An invalid commit message');

            expect(validationResult.isValid).to.be.false;
        });

        it('should return a validation result with errors when the commit message is invalid', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const validationResult = validator.validateCommitMessage('An invalid commit message');

            expect(validationResult.failures).to.not.be.empty;
        });
    });

    describe('validating a set of commit messages and checking for errors', () => {
        it('should return an array with the correct number of validation results', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const validationResults = validator.validateCommitMessages([
                'An invalid commit message',
                '[J#PROJ-123][BUG] Fix issue with foo'
            ]);

            expect(validationResults.length).to.equal(2);
        });

        it('should correctly identify valid and invalid commit messages', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const validationResults = validator.validateCommitMessages([
                'An invalid commit message',
                '[J#PROJ-123][BUG] Fix issue with foo'
            ]);

            // Check the result that should be invalid
            expect(validationResults[0].isValid).to.be.false;
            expect(validationResults[0].failures).not.to.be.empty;

            // Check the result that should be valid
            expect(validationResults[1].isValid).to.be.true;
            expect(validationResults[1].failures).to.be.empty;
        });
    });

    describe('checking if a commit message is valid', () => {
        it('should correctly identify a valid commit message', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const isValid = validator.isValidCommitMessage('[J#PROJ-123][BUG] Fix issue with foo');

            expect(isValid).to.be.true;
        });

        it('should correctly identify an invalid commit message', () => {
            const gitHelper = {};
            const validator = new Validator(gitHelper);

            const isValid = validator.isValidCommitMessage('An invalid commit message');

            expect(isValid).to.be.false;
        });
    });

    describe('validating a commit message for a specified SHA', () => {
        it('should correctly identify a valid commit message', done => {
            const gitHelper = {
                getCommitMessageFromSHA: () => {
                    return new Promise((resolve, reject) => {
                        resolve('[J#PROJ-123][BUG] Fix issue with foo');
                    });
                }
            };

            const validator = new Validator(gitHelper);

            validator.validateCommitMessageFromSHA('0d4d577f797a76b63421afc68b904a16ac817315')
                .then(validationResult => {
                    expect(validationResult.isValid).to.be.true;
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });

        it('should resolve with a validation result with no errors when the commit message is valid', () => {
            const gitHelper = {
                getCommitMessageFromSHA: () => {
                    return new Promise((resolve, reject) => {
                        resolve('[J#PROJ-123][BUG] Fix issue with foo');
                    });
                }
            };

            const validator = new Validator(gitHelper);

            validator.validateCommitMessageFromSHA('0d4d577f797a76b63421afc68b904a16ac817315')
                .then(validationResult => {
                    expect(validationResult.failures).to.be.empty;
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });

        it('should correctly identify an invalid commit message', done => {
            const gitHelper = {
                getCommitMessageFromSHA: () => {
                    return new Promise((resolve, reject) => {
                        resolve('An invalid commit message');
                    });
                }
            };

            const validator = new Validator(gitHelper);

            validator.validateCommitMessageFromSHA('0d4d577f797a76b63421afc68b904a16ac817315')
                .then(validationResult => {
                    expect(validationResult.isValid).to.be.false;
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });

        it('should resolve with a validation result with errors when the commit message is invalid', () => {
            const gitHelper = {
                getCommitMessageFromSHA: () => {
                    return new Promise((resolve, reject) => {
                        resolve('An invalid commit message');
                    });
                }
            };

            const validator = new Validator(gitHelper);

            validator.validateCommitMessageFromSHA('0d4d577f797a76b63421afc68b904a16ac817315')
                .then(validationResult => {
                    expect(validationResult.failures).not.to.be.empty;
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });
    });

    describe('validating commit messages for a specified set of SHAs', () => {
        it('should resolve with an array with the correct number of validation results', done => {
            const gitHelper = {
                getCommitMessageFromSHA: () => {
                    return new Promise((resolve, reject) => {
                        resolve('[J#PROJ-123][BUG] Fix issue with foo');
                    });
                }
            };

            const validator = new Validator(gitHelper);

            validator.validateCommitMessagesFromSHAs([
                '0d4d577f797a76b63421afc68b904a16ac817315',
                '6dc2762f049c8cd80fc3370a7defe06838f8b2bc'
            ])
                .then(validationResults => {
                    expect(validationResults.length).to.equal(2);
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });
    });

    describe('validating commit messages for a range of commit SHAs', () => {
        it('should resolve with an array with the correct number of validation results', done => {
            const gitHelper = {
                getCommitMessagesFromSHARange: () => {
                    return new Promise((resolve, reject) => {
                        resolve([
                            '[J#PROJ-123][BUG] Fix issue with foo',
                            'An invalid commit message'
                        ]);
                    });
                }
            };

            const validator = new Validator(gitHelper);
            const range = '0d4d577f797a76b63421afc68b904a16ac817315...0d4d577f797a76b63421afc68b904a16ac817315';

            validator.validateCommitMessagesFromSHARange(range)
                .then(validationResults => {
                    expect(validationResults.length).to.equal(2);
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });
    });
});
