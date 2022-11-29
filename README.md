# github-action-notify-release

GitHub Action that automatically creates an issue with an overview of the commits that are waiting to be released. After a new release is published, the issue will be automatically closed.

## Example

```yaml
name: notify-release
on:
  workflow_dispatch:
  release:
    types: [published]
  schedule:
    - cron: '30 8 * * *'
jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - name: Notify release
        uses: nearform/github-action-notify-release@v1
```

## Usage

Configure this action in your workflows providing the inputs described below in order to get notified in `x` time after the repo has been updated but no release has happened.
It is possibile to snooze the notification issue for `x` time by closing it as **not planned**. Once the time has passed a new issue will be created.

### `github-token`

**Optional** A GitHub token.

### `notify-after: '7 days'`

**Optional** The time after which unreleased commits should be considered stale and should notify for a release.
This option accepts various time formats as described by the time conversion library [ms](https://github.com/vercel/ms).
Example: `1 minute`.
Default is `7 days`.

### **Deprecated** `stale-days: 7`

**Optional** The time after which unreleased commits should be considered stale and should notify for a release. The value can be a number or a string.
Example: `1 minute`.
Default is `7` days.

### `commit-messages-lines: 1`

**Optional** Limit the number of first `x` lines from commit messages that will be added in the issue description. No truncation when set to `0`. Default is `1`.
