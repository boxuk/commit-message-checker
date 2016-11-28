'use strict';

const chai = require('chai');
const sinon = require('sinon');

chai.use(require('sinon-chai'));

const expect = chai.expect;

const library = require('../../lib');
const commitTypes = require('../../lib/commit-types').COMMIT_TYPES;

describe('checking valid commit messages', () => {
    for (const commitType of commitTypes) {
        const commitMessageWithTicket = `[J#PROJ-987][${commitType}] Some commit message`;
        const commitMessageWithoutTicket = `[${commitType}] Some commit message`;

        it(`should treat "${commitMessageWithTicket}" as a valid commit message`, () => {
            expect(library.isValidCommitMessage(commitMessageWithTicket)).to.be.true;
        });

        it(`should treat "${commitMessageWithoutTicket}" as a valid commit message`, () => {
            expect(library.isValidCommitMessage(commitMessageWithoutTicket)).to.be.true;
        });
    }
});
