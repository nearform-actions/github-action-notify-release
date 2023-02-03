'use strict'
const allCommitsData = {
  data: [
    {
      sha: '246479a5bedbd0efca05264905c57122f49d5d7e',
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:01:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:01:00Z',
        },
        message: `commit on main n.1`,
      },
    },
    {
      sha: '05693f56329d745bd44fc533b1b36986879933ca',
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:02:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:02:00Z',
        },
        message: `commit on main n.2


this message has multiple lines

`,
      },
    },
    {
      sha: '65460711e7f970f3a453c8ba09ea5c0776beb450',
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:03:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:03:00Z',
        },
        message: 'commit on main n.3',
      },
    },
    {
      sha: '61ff66b30612e7b16398d1b4fbcf788168ecbb08',
      pr_number: 1,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:03:30Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:03:30Z',
        },
        message: 'Merge pull request #1 from ...',
      },
    },
    {
      sha: 'fc846ca831d2ca7f75053813e68bd55013649d38',
      pr_number: 1,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:04:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:04:00Z',
        },
        message: 'PR 1 single commit',
      },
    },
    {
      sha: '41ff66b30612e7b16398d1b4fbcf788168ecbb08',
      pr_number: 2,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:04:30Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:04:30Z',
        },
        message: 'Merge pull request #2 from ...',
      },
    },
    {
      sha: '1ba09f94cea5686237769dc8c79c25054e75d124',
      pr_number: 2,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:05:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:05:00Z',
        },
        message: 'PR 2 single commit',
      },
    },
    {
      sha: '11xf66b30612e7b16398d1b4fbcf788168ecbb08',
      pr_number: 3,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:05:30Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:05:30Z',
        },
        message: 'Merge pull request #3 from ...',
      },
    },
    {
      sha: '35b9ba3f48a20f87223052bf0a9e2aefc49d1b7b',
      pr_number: 3,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:06:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:06:00Z',
        },
        message: 'PR 3 multiple commit n.1',
      },
    },
    {
      sha: '095c9909330ea7b7aa0ee5c64a5ac014c4d1ba0f',
      pr_number: 3,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:07:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:07:00Z',
        },
        message: 'PR 3 multiple commit n.2',
      },
    },
    {
      sha: '999f66b30612e7b16398d1b4fbcf788168ecbb08',
      pr_number: 4,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:06:30Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:06:30Z',
        },
        message: 'Merge pull request #4 from ...',
      },
    },
    {
      sha: 'a4a12ac0e5c9e292bb88350f6cd025c429bdb193',
      pr_number: 4,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:08:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:08:00Z',
        },
        message: 'PR 4 multiple commit n.1',
      },
    },
    {
      sha: '822b09b182c54e0dad44c7c72f930f0398a0f43b',
      pr_number: 4,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:09:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:09:00Z',
        },
        message: 'PR 4 multiple commit n.2',
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
    sha: '246479a5bedbd0efca05264905c57122f49d5d7e',
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:01:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:01:00Z',
      },
      message: 'commit on main n.1',
    },
  },
  {
    sha: '05693f56329d745bd44fc533b1b36986879933ca',
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:02:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:02:00Z',
      },
      message: `commit on main n.2


this message has multiple lines

`,
    },
  },
  {
    sha: '65460711e7f970f3a453c8ba09ea5c0776beb450',
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:03:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:03:00Z',
      },
      message: 'commit on main n.3',
    },
  },
  {
    sha: '61ff66b30612e7b16398d1b4fbcf788168ecbb08',
    pr_number: 1,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:03:30Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:03:30Z',
      },
      message: 'Merge pull request #1 from ...',
    },
  },
  {
    sha: 'fc846ca831d2ca7f75053813e68bd55013649d38',
    pr_number: 1,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:04:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:04:00Z',
      },
      message: 'PR 1 single commit',
    },
  },
  {
    sha: '41ff66b30612e7b16398d1b4fbcf788168ecbb08',
    pr_number: 2,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:04:30Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:04:30Z',
      },
      message: 'Merge pull request #2 from ...',
    },
  },
  {
    sha: '1ba09f94cea5686237769dc8c79c25054e75d124',
    pr_number: 2,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:05:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:05:00Z',
      },
      message: 'PR 2 single commit',
    },
  },
  {
    sha: '11xf66b30612e7b16398d1b4fbcf788168ecbb08',
    pr_number: 3,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:05:30Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:05:30Z',
      },
      message: 'Merge pull request #3 from ...',
    },
  },
  {
    sha: '35b9ba3f48a20f87223052bf0a9e2aefc49d1b7b',
    pr_number: 3,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:06:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:06:00Z',
      },
      message: 'PR 3 multiple commit n.1',
    },
  },
  {
    sha: '095c9909330ea7b7aa0ee5c64a5ac014c4d1ba0f',
    pr_number: 3,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:07:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:07:00Z',
      },
      message: 'PR 3 multiple commit n.2',
    },
  },
  {
    sha: '999f66b30612e7b16398d1b4fbcf788168ecbb08',
    pr_number: 4,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:06:30Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:06:30Z',
      },
      message: 'Merge pull request #4 from ...',
    },
  },
  {
    sha: 'a4a12ac0e5c9e292bb88350f6cd025c429bdb193',
    pr_number: 4,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:08:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:08:00Z',
      },
      message: 'PR 4 multiple commit n.1',
    },
  },
  {
    sha: '822b09b182c54e0dad44c7c72f930f0398a0f43b',
    pr_number: 4,
    commit: {
      author: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:09:00Z',
      },
      committer: {
        name: 'Davide Roffo',
        date: '2023-01-01T00:09:00Z',
      },
      message: 'PR 4 multiple commit n.2',
    },
  },
]

const groupedUnreleasedCommitsData0 = {
  commitsWithoutPRs: [],
  singleCommitPRs: [],
  multipleCommitPRs: {},
}

const groupedUnreleasedCommitsData1 = {
  commitsWithoutPRs: [
    {
      sha: '246479a5bedbd0efca05264905c57122f49d5d7e',
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:01:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:01:00Z',
        },
        message: 'commit on main n.1',
      },
    },
    {
      sha: '05693f56329d745bd44fc533b1b36986879933ca',
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:02:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:02:00Z',
        },
        message: `commit on main n.2


this message has multiple lines

`,
      },
    },
    {
      sha: '65460711e7f970f3a453c8ba09ea5c0776beb450',
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:03:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:03:00Z',
        },
        message: 'commit on main n.3',
      },
    },
  ],
  singleCommitPRs: [
    {
      sha: 'fc846ca831d2ca7f75053813e68bd55013649d38',
      pr_number: 1,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:04:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:04:00Z',
        },
        message: 'PR 1 single commit',
      },
    },
    {
      sha: '1ba09f94cea5686237769dc8c79c25054e75d124',
      pr_number: 2,
      commit: {
        author: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:05:00Z',
        },
        committer: {
          name: 'Davide Roffo',
          date: '2023-01-01T00:05:00Z',
        },
        message: 'PR 2 single commit',
      },
    },
  ],
  multipleCommitPRs: {
    3: [
      {
        sha: '35b9ba3f48a20f87223052bf0a9e2aefc49d1b7b',
        pr_number: 3,
        commit: {
          author: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:06:00Z',
          },
          committer: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:06:00Z',
          },
          message: 'PR 3 multiple commit n.1',
        },
      },
      {
        sha: '095c9909330ea7b7aa0ee5c64a5ac014c4d1ba0f',
        pr_number: 3,
        commit: {
          author: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:07:00Z',
          },
          committer: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:07:00Z',
          },
          message: 'PR 3 multiple commit n.2',
        },
      },
    ],
    4: [
      {
        sha: 'a4a12ac0e5c9e292bb88350f6cd025c429bdb193',
        pr_number: 4,
        commit: {
          author: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:08:00Z',
          },
          committer: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:08:00Z',
          },
          message: 'PR 4 multiple commit n.1',
        },
      },
      {
        sha: '822b09b182c54e0dad44c7c72f930f0398a0f43b',
        pr_number: 4,
        commit: {
          author: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:09:00Z',
          },
          committer: {
            name: 'Davide Roffo',
            date: '2023-01-01T00:09:00Z',
          },
          message: 'PR 4 multiple commit n.2',
        },
      },
    ],
  },
}

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
    closed_at: '2011-04-22T13:33:48Z',
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
  groupedUnreleasedCommitsData0,
  groupedUnreleasedCommitsData1,
  pendingIssues,
  closedNotifyIssues,
  closedNotifyIssuesNeverStale,
}
