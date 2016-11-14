# Commit message checker

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

Finally, we don't subject merge commits to the same validation checks. i.e. validating the commit message:

`Merge pull request #123 from boxuk/develop`

Will be considered a valid commit message.

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

### Multi-line commit messages

We encourage (but don't enforce) that commit messages use more than one line. This is to allow for a
short and terse first line in the above format, along with a more detailed description of the change,
reasoning behind the change, any notes, etc.

Where a commit message contains multiple lines, we require that a new-line be present between the commit
message (first-line) and commit description.

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

- Install this package as a dependency of your project

- In your `.travis.yml` file, include the following in your `script` section:

```yml
- node_modules/.bin/travis-commit-message-checker
```

#### Appveyor

- Install this package as a dependency of your project

- In your `appeyor.yml` file, include the following in your `test_script` section:

```yml
- cmd: node_modules/.bin/appveyor-commit-message-checker
```

### As a Node module

The Node module exposes two functions:
    - `isValidCommitMessage`, and
    - `validateCommitMessage`

Both are documented in more detail below.

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
```

#### `isValidCommitMessage (commitMessage : string) : boolean`

Check whether a commit message is valid. Returns true if valid, and false if not.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.isValidCommitMessage('[BUG] Fix issue with foo'); // true
```

#### `validateCommitMessage (commitMessage : string) : { isValid: boolean, failues: Array<string> }`

Check both that a commit message is valid, and if it's not then get a list of reasons why not.

```javascript
const commitMessageChecker = require('commit-message-checker');

commitMessageChecker.validateCommitMessage('[BUG] Fix issue with foo'); // { isValid: true, failures: [] }
commitMessageChecker.validateCommitMessage('Fix issue with foo'); // { isValid: false, failures: [ 'MISSING_OR_INVALID_COMMIT_TYPE', 'FIRST_LINE_INVALID_FORMAT' ] }
```
