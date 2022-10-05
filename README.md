# github-action-notify-release

GitHub Action that automatically creates an issue with an overview of the commits that are waiting to be released. After creating the release, the issue will be automatically closed during next action run.

## Example

```yaml
name: notify-release
on:
  workflow_dispatch:
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

Configure this action in your workflows providing the inputs described below in order to get notified in `x` days after the repo has been updated but no release has happened.

### `github-token`
**Optional** A GitHub token.

### `stale-days: 7`
_Optional_ The number of days after which unreleased commits should be considered stale and should notify for a release. Default is `7`.

### `commit-messages-lines: 1`
_Optional_ Limit the number of first x lines from commit messages that will be added in the issue description. No truncation when set to `0`. Default is `1`.


## Auto close issue after release
If you want to automatically close the issue created for the pending release after the release is successfull then you can configure a workflow as follows:

```yaml
name: close release issue

on:
  workflow_run:
    workflows: [release]
    branches:
      - main
      - master
    types:
      - completed

env:
  GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  REPO: ${{ github.repository }}

jobs:
  closeIssue:
      name: Close release issue
      runs-on: ubuntu-latest
      steps:
        - name: Find issues
          id: release-issue
          run: |
            issueNumber="$(gh search issues --repo=$REPO --state=open --label=notify-release --json=number | jq -r '.[0].number')"
            echo "::set-output name=issue::$issueNumber"
        - name: Close release issues
          run: |
            gh issue close --repo=$REPO "$ISSUE_NUMBER"
          env:
            ISSUE_NUMBER: ${{ steps.release-issue.outputs.issue }}
```
