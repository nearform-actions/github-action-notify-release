# github-action-notify-release

GitHub Action that automatically creates an issue with an overview of the commits that are waiting to be released. After a new release is published, the issue will be automatically closed.

## Permissions

This action requires the following permissions:
  - `issues: write`
  - `contents: read`

💡 `contents:read` is required because the action is using a `actions/checkout@v3` action to download the repository content.

## Usage

Configure this action in your workflows providing the inputs described below in order to get notified in `x` time after the repo has been updated but no release has happened.
It is possible to snooze the notification issue for `x` time by closing it as **not planned**. Once the time has passed a new issue will be created.

## Inputs

| inputs                   | required | default               | description |
|--------------------------|----------|-----------------------|-------------|
| `github-token`           | no       | `${{ github.token }}` | A github token. |
| `notify-after`           | no       |                       | The time after which unreleased commits should be considered stale and should notify for a release.<br />This option accepts various time formats as described by the time conversion library [ms](https://github.com/vercel/ms). |
| `stale-days`             | no       | `7`                   | ⚠️ **Deprecated** Number of days of inactivity before a release becomes stale. The value can be a number or a string. |
| `commit-messages-lines:` | no       | `1`                   | Limit the number of first `x` lines from commit messages that will be added in the issue description. No truncation when set to `0`. |

## Example

```yaml
name: notify-release
on:
  workflow_dispatch:
  release:
    types: [published]
  issues:
    types: [closed]
  schedule:
    - cron: '30 8 * * *'
jobs:
  setup:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read
    steps:
      - name: Notify release
        uses: nearform-actions/github-action-notify-release@v1
```
