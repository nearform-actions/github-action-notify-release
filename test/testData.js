'use strict'
const allCommitsData = {
  data: [
    {
      sha: '000001abcd',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-28T09:27:24Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-28T09:27:24Z',
        },
        message: `variable changed
    
    
this message has multiple lines

`,
      },
    },
    {
      sha: '000002a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T12:49:23Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T12:49:23Z',
        },
        message: 'stale days changd',
      },
    },
    {
      sha: '000003a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:50:36Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:50:36Z',
        },
        message: 'another fix',
      },
    },
    {
      sha: '000004a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:42:44Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:42:44Z',
        },
        message: 'minor fix',
      },
    },
    {
      sha: '000005a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:41:20Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:41:20Z',
        },
        message: 'changed url',
      },
    },
    {
      sha: '000006a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:08:23Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:08:23Z',
        },
        message: 'action repo url changed',
      },
    },
    {
      sha: '000007a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:02:56Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T08:02:56Z',
        },
        message: 'added test function',
      },
    },
    {
      sha: '000008a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T07:37:09Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T07:37:09Z',
        },
        message: 'dummy function added',
      },
    },
    {
      sha: '000009a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T06:14:09Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T06:14:09Z',
        },
        message: 'repo name corrected',
      },
    },
    {
      sha: '000010a',
      commit: {
        author: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T06:11:47Z',
        },
        committer: {
          name: 'Sameer Srivastava',
          date: '2021-04-27T06:11:47Z',
        },
        message: 'workflow updated',
      },
    },
    {
      commit: {
        author: { name: 'Sameer Srivastava', date: '2021-04-26T13:25:08Z' },
        committer: { name: 'GitHub', date: '2021-04-26T13:25:08Z' },
        message: 'workflow created',
      },
    },
    {
      commit: {
        author: { name: 'Sameer Srivastava', date: '2021-04-26T13:15:48Z' },
        committer: { name: 'GitHub', date: '2021-04-26T13:15:48Z' },
        message: 'Initial commit',
      },
    },
  ],
}

const allReleasesData = [
  {
    name: 'Release 2.0',
    created_at: '2021-03-27T07:37:09Z',
    published_at: '2021-04-27T07:37:09Z',
    Tag: '2.0',
    author: 'sameer',
  },
  {
    name: 'Release 1.0',
    created_at: '2021-03-20T07:37:09Z',
    published_at: '2021-04-20T07:37:09Z',
    Tag: '1.0',
    author: 'gilach',
  },
]

const unreleasedCommitsData0 = []

const unreleasedCommitsData1 = [
  {
    sha: '000001abcd',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-28T09:27:24Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-28T09:27:24Z',
      },
      message: `variable changed
    
    
this message has multiple lines

`,
    },
  },
  {
    sha: '000002a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T12:49:23Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T12:49:23Z',
      },
      message: 'stale days changd',
    },
  },
  {
    sha: '000003a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:50:36Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:50:36Z',
      },
      message: 'another fix',
    },
  },
  {
    sha: '000004a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:42:44Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:42:44Z',
      },
      message: 'minor fix',
    },
  },
  {
    sha: '000005a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:41:20Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:41:20Z',
      },
      message: 'changed url',
    },
  },
  {
    sha: '000006a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:08:23Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:08:23Z',
      },
      message: 'action repo url changed',
    },
  },
  {
    sha: '000007a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:02:56Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T08:02:56Z',
      },
      message: 'added test function',
    },
  },
  {
    sha: '000008a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T07:37:09Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T07:37:09Z',
      },
      message: 'dummy function added',
    },
  },
  {
    sha: '000009a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T06:14:09Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T06:14:09Z',
      },
      message: 'repo name corrected',
    },
  },
  {
    sha: '000010a',
    commit: {
      author: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T06:11:47Z',
      },
      committer: {
        name: 'Sameer Srivastava',
        date: '2021-04-27T06:11:47Z',
      },
      message: 'workflow updated',
    },
  },
  {
    commit: {
      author: { name: 'Sameer Srivastava', date: '2021-04-26T13:25:08Z' },
      committer: { name: 'GitHub', date: '2021-04-26T13:25:08Z' },
      message: 'workflow created',
    },
  },
  {
    commit: {
      author: { name: 'Sameer Srivastava', date: '2021-04-26T13:15:48Z' },
      committer: { name: 'GitHub', date: '2021-04-26T13:15:48Z' },
      message: 'Initial commit',
    },
  },
]

const pendingIssues = [
  {
    number: '1',
    updated_at: '2021-04-26T07:37:09Z',
  },
]

const closedNotifyIssues = [
  {
    id: 1,
    number: 1347,
    state: 'closed',
    title: 'Notify release 1',
    body: 'Release new feature',
    closed_at: '2011-04-22T13:33:48Z',
    state_reason: 'not_planned',
  },
  {
    id: 2,
    number: 1347,
    state: 'closed',
    title: 'Notify release 2',
    body: 'Release new feature',
    closed_at: '2200-04-22T13:33:48Z',
    state_reason: 'not_planned',
  },
]

const closedNotifyIssuesNeverStale = [
  {
    id: 1,
    number: 1347,
    state: 'closed',
    title: 'Notify release 1',
    body: 'Release new feature',
    closed_at: '2201-04-22',
    state_reason: 'not_planned',
  },
  {
    id: 2,
    number: 1347,
    state: 'closed',
    title: 'Notify release 2',
    body: 'Release new feature',
    closed_at: '2200-04-22',
    state_reason: 'not_planned',
  },
]

module.exports = {
  allCommitsData,
  allReleasesData,
  unreleasedCommitsData0,
  unreleasedCommitsData1,
  pendingIssues,
  closedNotifyIssues,
  closedNotifyIssuesNeverStale,
}
