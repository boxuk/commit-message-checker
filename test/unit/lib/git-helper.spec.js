'use strict';

const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

const expect = chai.expect;

const GitHelper = require('../../../lib/git-helper');

describe('git helper library', () => {
    describe('getting the commit message for a given SHA', () => {
        it('should call through to child_process.exec with the correct arguments', () => {
            const exec = sinon.stub();
            const gitHelper = new GitHelper(exec);
            const sha = '199808430201dea9342dc0406fc34a9ecc7fb1c0';

            gitHelper.getCommitMessageFromSHA(sha);

            expect(exec).to.have.been.calledWith(`git log -1 --pretty=format:%B ${sha}`);
        });

        it('should return a promise that is resolved with the stdout of child_process.exec', done => {
            const exec = (commmand, callback) => {
                const error = null;
                const stdout = '[BUG] Some commit message';

                callback(error, stdout);
            };

            const gitHelper = new GitHelper(exec);

            gitHelper.getCommitMessageFromSHA('0d4d577f797a76b63421afc68b904a16ac817315')
                .then(commitMessage => {
                    expect(commitMessage).to.equal('[BUG] Some commit message');
                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });

        it('should return a promise that is rejected when the exec command errors', done => {
            const exec = (commmand, callback) => {
                const error = 'Some error';

                callback(error);
            };

            const gitHelper = new GitHelper(exec);

            gitHelper.getCommitMessageFromSHA('0d4d577f797a76b63421afc68b904a16ac817315')
                .catch(() => {
                    done();
                });
        });
    });

    describe('getting the commit messages for the specified SHAs', () => {
        it('should call through to child_process.exec with the correct arguments', () => {
            const exec = sinon.stub();
            const gitHelper = new GitHelper(exec);
            const shas = [
                '199808430201dea9342dc0406fc34a9ecc7fb1c0',
                '0d4d577f797a76b63421afc68b904a16ac817315',
                '6dc2762f049c8cd80fc3370a7defe06838f8b2bc'
            ];

            gitHelper.getCommitMessagesFromSHAs(shas);

            expect(exec).to.have.been.calledWith(`git log -1 --pretty=format:%B ${shas[0]}`);
            expect(exec).to.have.been.calledWith(`git log -1 --pretty=format:%B ${shas[1]}`);
            expect(exec).to.have.been.calledWith(`git log -1 --pretty=format:%B ${shas[2]}`);
        });

        it('should return a promise that resolves with an array of commit messages', done => {
            const exec = (commmand, callback) => {
                const error = null;
                const stdout = '[BUG] Some commit message';

                callback(error, stdout);
            };

            const gitHelper = new GitHelper(exec);
            const shas = [
                '199808430201dea9342dc0406fc34a9ecc7fb1c0',
                '0d4d577f797a76b63421afc68b904a16ac817315',
                '6dc2762f049c8cd80fc3370a7defe06838f8b2bc'
            ];

            gitHelper.getCommitMessagesFromSHAs(shas)
                .then(commitMessages => {
                    expect(commitMessages.length).to.equal(3);
                    expect(commitMessages[0]).to.equal('[BUG] Some commit message');
                    expect(commitMessages[1]).to.equal('[BUG] Some commit message');
                    expect(commitMessages[2]).to.equal('[BUG] Some commit message');

                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });

        it('should return a promise that rejects when a commit message cannot be retrieved', done => {
            const exec = (commmand, callback) => {
                const error = 'Some error';

                callback(error);
            };

            const gitHelper = new GitHelper(exec);
            const shas = [
                '199808430201dea9342dc0406fc34a9ecc7fb1c0',
                '0d4d577f797a76b63421afc68b904a16ac817315'
            ];

            gitHelper.getCommitMessagesFromSHAs(shas)
                .catch(() => {
                    done();
                });
        });
    });

    describe('getting the commits SHAs from a range of commits', () => {
        it('should call through to child_process.exec with the correct arguments', () => {
            const exec = sinon.stub();
            const gitHelper = new GitHelper(exec);
            const range = '199808430201dea9342dc0406fc34a9ecc7fb1c0..0d4d577f797a76b63421afc68b904a16ac817315';

            gitHelper.getCommitSHAsInRange(range);

            expect(exec).to.have.been.calledWith(`git log --pretty=format:%H ${range}`);
        });

        it('should return a promise that resolves with an array of the commit SHAs', done => {
            const exec = (commmand, callback) => {
                const error = null;
                const stdout = '0d4d577f797a76b63421afc68b904a16ac817315\n6dc2762f049c8cd80fc3370a7defe06838f8b2bc';

                callback(error, stdout);
            };

            const gitHelper = new GitHelper(exec);
            const range = '199808430201dea9342dc0406fc34a9ecc7fb1c0..6dc2762f049c8cd80fc3370a7defe06838f8b2bc';

            gitHelper.getCommitSHAsInRange(range)
                .then(commitMessages => {
                    expect(commitMessages.length).to.equal(2);
                    expect(commitMessages[0]).to.equal('0d4d577f797a76b63421afc68b904a16ac817315');
                    expect(commitMessages[1]).to.equal('6dc2762f049c8cd80fc3370a7defe06838f8b2bc');

                    done();
                })
                .catch(error => {
                    error = error || 'Unknown error';
                    done(error);
                });
        });

        it('should return a promise that rejects when unable to retrieve the commit messages', done => {
            const exec = (commmand, callback) => {
                const error = 'Some error';

                callback(error);
            };

            const gitHelper = new GitHelper(exec);
            const range = '199808430201dea9342dc0406fc34a9ecc7fb1c0..6dc2762f049c8cd80fc3370a7defe06838f8b2bc';

            gitHelper.getCommitSHAsInRange(range)
                .catch(() => {
                    done();
                });
        });
    });
});
