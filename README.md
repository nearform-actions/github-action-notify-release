# github-action-notify-release

## Usage
Configure this action in your workflows providing the inputs described below in order to get notified in `x` days after the repo has been updated but no npm release has happened.

### `github-token`
**Required** A GitHub token. See below for additional information.

### `days-to-stale-release`
_Optional_ The number of days after which unreleased commits should be considered stale and should notify for a release. Default is `7`.

## Notes
- Checks and compares npm last modified date and git latest repo update.
- If the repo doesn't have an npm package linked the run will exit with a warning log.
- A GitHub token is automatically provided by Github Actions, which can be accessed using `secrets.GITHUB_TOKEN` and supplied to the action as an input `github-token`.
- The example below sets a scheduled job to happen once a day that checks for a stale release. Adjust to the desired frequency.

## Example
```
name: notify-pending-release
on:
  workflow_dispatch:
    branches:
      - main
  schedule:
    - cron: '30 8 * * *'
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2.2.0
      - uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
      - name: Check if there's a release pending
        id: notify
        uses: estherixz/github-action-notify-release@main
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          days-to-stale-release: 7

```
