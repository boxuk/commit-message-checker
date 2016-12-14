<p align="center"><a href="https://www.boxuk.com"><img src="https://s.gravatar.com/avatar/ecc7a149e4a6fc92c0f2b37a0d121877?s=150" width="150" alt="Box UK" /></a></p>
<p align="center">A strict and opinionated set of tools for validating commit messages</p>
<p align="center">
    <a href="https://travis-ci.com/boxuk/commit-message-checker">
        <img src="https://travis-ci.com/boxuk/commit-message-checker.svg?token=PXYWMazXQJ8xQq72h6EJ&branch=master" alt="Travis Build Status" />
    </a>
    <a href="https://codeclimate.com/github/boxuk/commit-message-checker">
        <img src="https://codeclimate.com/github/boxuk/commit-message-checker/badges/gpa.svg" alt="Code Climate" />
    </a>
    <a href="https://codeclimate.com/github/boxuk/commit-message-checker/coverage">
        <img src="https://codeclimate.com/github/boxuk/commit-message-checker/badges/coverage.svg" alt="Test Coverage" />
    </a>
    <a href="https://codeclimate.com/github/boxuk/commit-message-checker">
        <img src="https://codeclimate.com/github/boxuk/commit-message-checker/badges/issue_count.svg" alt="Issue Count" />
    </a>
</p>

---

# Commit message checker

* [Overview](#overview)
  * [Valid commit types](#valid-commit-types)
  * [Failure reasons](#failure-reasons)
  * [Multi-line commit messages](#multi-line-commit-messages)
* [Usage](#usage)
  * [As part of CI](#as-part-of-ci)
    * [Travis](#travis)
        * [Node projects](#for-node-projects)
        * [Non-Node projects](#for-non-node-projects)
    * [Appveyor](#appveyor)
  * [As a commit hook](#as-a-commit-hook)
  * [As a Node module](#as-a-node-module)
    * [Quick overview of basic usage](#quick-overview-of-basic-usage)
    * [API documentation](#api-documentation)

## Overview

A Node module for checking the format of Git commit messages.

This is a highly opinionated tool that doesn't offer any configuration, and is written to validate
commit messages in the format that we, at Box UK, use across our organisation.

This strict format is:

`[J#PROJ-123][BUG] Fix foo issue with bar`

Where:
- `J#` refers to the ticket system (in this case, JIRA),
- `PROJ-123` refers to the ticket number,
- `BUG` refers to the commit type (see *"Valid commit types"* below), and
-  `Fix foo issue with bar` is a terse description of the change

A slight variation on this format is where a ticket number cannot be specified, in which case the
ticketing system and ticket number should be omitted. The commit message should then read:

`[BUG] Fix foo issue with bar`

Finally, we don't subject merge or revert commits to the same validation checks. i.e. when validating the commit messages:

`Merge pull request #123 from boxuk/develop`

and

`Revert "[J#PROJ-123][BUG] Fix issue with foo"`

Both will be considered valid commit messages.

### Valid commit types

Commit types should be specified in upper-case and be one of the following values:
- **BUG** *(Bug fix)*
- **CONFIG** *(Config value changes or updating dependencies / 3rd party libraries)*
- **FEATURE** *(Adding a new feature or functionality)*
- **FORMAT** *(Change in the format or styling of code)*
- **REFACTOR** *(Change the structure of the code without changing its function)*
- **DOCS** *(An update not related to code, but to documentation in the repo)*
- **SETUP** *(To be used early in project for setting up the initial app)*

If you need to change this, you'll need to update [lib/commit-types.js](./lib/commit-types.js) with
the required values.

### Failure reasons

Should a commit message fail validation, one or more failure reasons will be included in the `ValidationResult` that
is returned.

These failure reasons can be one or more of:

| Reason                         | Explanation                                                                                     |
|--------------------------------|-------------------------------------------------------------------------------------------------|
| NO_NEW_LINE_AFTER_FIRST_LINE   | For multi-line commit messages, there should be a new-line between the summary and description  |
| MISSING_OR_INVALID_COMMIT_TYPE | The commit summary is missing a commit type (documented above), or the one specified is invalid |
| FIRST_LINE_INVALID_FORMAT      | The first line (the summary) is in an invalid format                                            |

### Multi-line commit messages

We encourage (but don't enforce) that commit messages use more than one line. This is to allow for a
short and terse first line in the above format, along with a more detailed description of the change,
reasoning behind the change, any notes, etc.

Where a commit message contains multiple lines, we require that a new-line be present between the summary (first-line)
and commit description.

For example:

#### Good example
```
[J#PROJ-987][FEATURE] Add login form

This commit adds a responsive login form that authenticates using our LDAP server.
Registrations are not currently supported and will be addressed in J#PROJ-988.
```

#### Bad example
```
[J#PROJ-987][FEATURE] Add login form
This commit adds a responsive login form that authenticates using our LDAP server.
Registrations are not currently supported and will be addressed in J#PROJ-988.
```

## Usage

### As part of CI

#### Travis

##### For Node projects

- Install this package as a dependency of your project:

`npm install --save-dev commit-message-checker`

- In your `.travis.yml` file, include the following in your `script` section:

```yml
- node_modules/.bin/travis-commit-message-checker
```

##### For non-Node projects

This is a Node module, and as such requires Node to run (v4+). If you're building a non-Node project on Travis, then
you're in luck!

Travis build images include Node by default, though it's a very old version (v0.10.x) that won't work with this library.
However, it also includes Node Version Manager (`nvm`) so you can install the specific version of Node required.

Therefore, for non-Node projects on Travis you can run this tool by adding the following to your `.travis.yml` file:

```yml
install:
    # Install current LTS version of Node, and install commit-message-checker as a dependency
    - nvm install 6.9 && npm install commit-message-checker@^1.0.0

script:
    # Run the commit message checker as part of the test scripts
    - ./node_modules/.bin/travis-commit-message-checker

# Optional: Add the "node_modules" directory to the Travis build cache so as to speed up subsequent builds
cache:
    directories:
        - node_modules
```

#### Appveyor

- Install this package as a dependency of your project

- In your `appveyor.yml` file, include the following in your `test_script` section:

```yml
- cmd: node_modules/.bin/appveyor-commit-message-checker
```

### As a commit hook

A `commit-msg` hook is provided which you can setup to run in your development environment, to help catch invalid commit
messages as they happen.

This is intended to be setup in addition to, and definitely not instead of, checks that run [as part of CI](#as-part-of-ci).
It's primary purpose is to shorten the feedback time between commiting something, and finding out that the commit
message is invalid. The alternative being that you don't find out until it fails on CI, which could take a frustrating
amount of time.

To use the commit hook, copy or symlink the file to `.git/hooks/commit-msg` within your project. i.e. run:

```bash
ln -s -f ../../node_modules/.bin/commit-message-hook .git/hooks/commit-msg
```

After doing so, all commits you make will be validated.

If any commit message fails, you'll be shown a failure report detailing the reason(s) why the message isn't valid.

However, this **will not block the commit** from happening.
We want to limit impact on developer workflow as much as possible, and so this will notify you that a commit message is
invalid, but the onus will be on you to go back and correct it. We've made this decision so as not to prevent you
making a series of quick commits as you work, with the intention of going back and fixing up / re-wording commits prior
to pushing to your SCM.

### As a Node module

The Node module exposes several functions:
- `validateCommitMessage`
- `validateCommitMessages`
- `validateCommitMessageFromSHA`
- `validateCommitMessagesFromSHAs`
- `validateCommitMessagesFromSHARange`
- `isValidCommitMessage`

All are documented in more detail below.

#### Quick overview of basic usage

```javascript
'use strict';

const commitMessageChecker = require('commit-message-checker');

const commitMessage = 'Some commit message';

// Check if commit message is valid
commitMessageChecker.isValidCommitMessage(commitMessage);
// Returns: false

// Validate a commit message, which will return both whether the commit message is
// valid, as well as any reasons it is invalid (where appropriate)
commitMessageChecker.validateCommitMessage(commitMessage);
 // Returns: { isValid: false, failures: [ 'MISSING_OR_INVALID_COMMIT_TYPE', 'FIRST_LINE_INVALID_FORMAT' ] }

 // Validate a commit message by it's SHA
 commitMessageChecker.validateCommitMessageFromSHA('sha8234hdsf')
    .catch(error => {
        throw new Error(`Failed to retrieve commit message: ${error}`);
    })
    .then(validationResult => {
        if (validationResult.isValid === true) {
            // the commit message is valid
            console.log(`The commit message "${validationResult.commitMessage}" is valid!`);
        } else {
            // the commit message is invalid, and will contain an array of failure reasons
            console.error(validationResult.failures);
        }
    });
```

#### API documentation

##### `isValidCommitMessage (commitMessage : string) : boolean`

Check whether a commit message is valid. Returns true if valid, and false if not.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.isValidCommitMessage('[BUG] Fix issue with foo'); // true
```

##### `validateCommitMessage (commitMessage : string) : ValidationResult`

Check both that a commit message is valid, and if it's not then get a list of reasons why not.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.validateCommitMessage('[BUG] Fix issue with foo'); // { isValid: true, failures: [], commitMessage: '[BUG] Fix issue with foo' }
commitMessageChecker.validateCommitMessage('Fix issue with foo'); // { isValid: false, failures: [ 'MISSING_OR_INVALID_COMMIT_TYPE', 'FIRST_LINE_INVALID_FORMAT' ], commitMessage: 'Fix issue with foo' }
```

##### `validateCommitMessages (commitMessages : Array<string>) : Array<ValidationResult>`

Check an array of commit messages for validity. Returns an array of `ValidationResult` objects.

Essentially this is the same as `validateCommitMessage` except it handles deals with arrays of
messages and results, instead of a single message and result.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.validateCommitMessages(['[BUG] Fix issue with foo', '[DOCS] Fix typo in README.md']);
// Returns:
// [
//    { isValid: true, failures: [], commitMessage: '[BUG] Fix issue with foo' }
//    { isValid: true, failures: [], commitMessage: '[DOCS] Fix typo in README.md' }
// ]
```

##### `validateCommitMessageFromSHA (sha : string) : Promise<ValidationResult>`

Check a commit message for validity, using the SHA of the commit.

This is an asynchronous operation that returns a promise. The promise will resolve with
a `ValidationResult` object. If the commit message cannot be retrieved using the specified
SHA, then the promise will be rejected with the relevant error.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.validateCommitMessageFromSHA('df65141')
    .catch(error => {
        console.error('Failed to validate commit message via SHA');
        throw new Error(error);
    })
    .then(validationResult => {
        if (!validationResult.isValid) {
            console.error(`Invalid commit message: "${validationResult.commitMessage}"`);

            for (const failure of validationResult.failures) {
                console.error(failure);
            }
        }
    });
```

##### `validateCommitMessagesFromSHAs (shas : Array<string>) : Promise<Array<ValidationResult>>`

Check a set of commit messages for validity, using the SHAs of the commits.

This is essentially the same as `validateCommitMessageFromSHA` except it deals with multiple
SHAs and validation results.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.validateCommitMessageFromSHA(['df65141', 'e43fcab'])
    .catch(error => {
        console.error('Failed to validate commit messages via SHAs');
        throw new Error(error);
    })
    .then(validationResults => {
        const failedValidations = validationResults.filter(validationResult => validationResult.isValid === false);

        for (const validationResult of failedValidations) {
            console.error(`Invalid commit message: "${validationResult.commitMessage}"`);
        }
    });
```

##### `validateCommitMessagesFromSHARange (shaRange : string) : Promise<Array<ValidationResult>>`

Check a set of commit messages for validity, using a range of commit SHAs.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.validateCommitMessagesFromSHARange('e43fcab..3ff3209')
    .catch(error => {
        console.error('Failed to validate commit messages via SHA range');
        throw new Error(error);
    })
    .then(validationResults => {
        const failedValidations = validationResults.filter(validationResult => validationResult.isValid === false);

        for (const validationResult of failedValidations) {
            console.error(`Invalid commit message: "${validationResult.commitMessage}"`);
        }
    });
```
