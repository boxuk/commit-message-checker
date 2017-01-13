'use strict';

const rc = require('rc');

const config = rc('commit-message-checker', {
    /**
     * Ignore pull requests when they originate from certain branches.
     *
     * Why would we want to do this?
     * =============================
     *
     * We've found that when this tool is introduced to an existing project, there can be invalid commits
     * that already exist on long running, shared branches.
     *
     * For example if develop already contains many commits not yet in master, and then the commit message
     * checker is added, when a pull request is created to merge develop into master, it can fail if any of
     * the commits are invalid.
     *
     * That may sound correct, but to fix the issue you'd have to rewrite history of the branch, which is
     * an extremely undesirable thing to do on a shared branch. Far better to just let the invalid commits
     * through and know that the standard will be enforced on all future commits.
     *
     * This boils down to being able to ignore specific long running, shared branches.
     *
     * For most projects this would be master and develop, but would have to be configurable on a
     * per-project basis (long running feature branches, etc.).
     *
     * The defaults here should be acceptable for most projects (i.e. the example given above, plus back-merging
     * master into develop, e.g. for hot fixes).
     */
    ignorePullRequestsFromBranches: [
        'master',
        'develop'
    ]
});

module.exports = config;
