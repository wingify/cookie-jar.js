## Setup

1. [Fork **cookie-jar**](https://help.github.com/articles/fork-a-repo) and clone it on your system.
2. Create a new branch off `master` for your fix/feature. `git checkout new-feature master`

## Building

To install all the dependencies, run `npm install`.

- To minify and get a production build, run `npm run minify`.
- To lint the js files, run `npm run lint`.

## Running Tests

Run `npm test`.

## General Guidelines

- Do not fix multiple issues in a single commit. Keep them one thing per commit so that they can be picked easily 
in case only few commits require to be merged.
- Before submitting a patch, rebase your branch on upstream `master` to make life easier for the merger.
