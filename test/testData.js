'use strict'
const allCommitsData = {
  data: [{
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-28T09:27:24Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-28T09:27:24Z"
      },
      "message": `variable changed
    
    
this message has multiple lines

`
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T12:49:23Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T12:49:23Z"
      },
      "message": "stale days changd",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:50:36Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:50:36Z"
      },
      "message": "another fix",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:42:44Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:42:44Z"
      },
      "message": "minor fix",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:41:20Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:41:20Z"
      },
      "message": "changed url",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:08:23Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:08:23Z"
      },
      "message": "action repo url changed",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:02:56Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T08:02:56Z"
      },
      "message": "added test function",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T07:37:09Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T07:37:09Z"
      },
      "message": "dummy function added",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T06:14:09Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T06:14:09Z"
      },
      "message": "repo name corrected",
    },
  }, {
    "commit": {
      "author": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T06:11:47Z"
      },
      "committer": {
        "name": "Sameer Srivastava",
        "date": "2021-04-27T06:11:47Z"
      },
      "message": "workflow updated",
    },
  }, {
    "commit": {
      "author": {"name": "Sameer Srivastava", "date": "2021-04-26T13:25:08Z"},
      "committer": {"name": "GitHub", "date": "2021-04-26T13:25:08Z"},
      "message": "workflow created",
    },
  }, {
    "commit": {
      "author": {"name": "Sameer Srivastava", "date": "2021-04-26T13:15:48Z"},
      "committer": {"name": "GitHub", "date": "2021-04-26T13:15:48Z"},
      "message": "Initial commit",
    },
  }]
}

const allReleasesData = {
  data: [
    {
      name: 'Release 2.0',
      created_at: '2021-04-27T07:37:09Z',
      Tag: '2.0',
      author: 'sameer'
    }
  ]
}

const unreleasedCommitsData0 = []


const unreleasedCommitsData1 = [{
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-28T09:27:24Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-28T09:27:24Z"
    },
    "message": `variable changed
    
    
this message has multiple lines

`,
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T12:49:23Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T12:49:23Z"
    },
    "message": "stale days changd",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:50:36Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:50:36Z"
    },
    "message": "another fix",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:42:44Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:42:44Z"
    },
    "message": "minor fix",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:41:20Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:41:20Z"
    },
    "message": "changed url",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:08:23Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:08:23Z"
    },
    "message": "action repo url changed",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:02:56Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T08:02:56Z"
    },
    "message": "added test function",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T07:37:09Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T07:37:09Z"
    },
    "message": "dummy function added",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T06:14:09Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T06:14:09Z"
    },
    "message": "repo name corrected",
  },
}, {
  "commit": {
    "author": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T06:11:47Z"
    },
    "committer": {
      "name": "Sameer Srivastava",
      "date": "2021-04-27T06:11:47Z"
    },
    "message": "workflow updated",
  },
}, {
  "commit": {
    "author": {"name": "Sameer Srivastava", "date": "2021-04-26T13:25:08Z"},
    "committer": {"name": "GitHub", "date": "2021-04-26T13:25:08Z"},
    "message": "workflow created",
  },
}, {
  "commit": {
    "author": {"name": "Sameer Srivastava", "date": "2021-04-26T13:15:48Z"},
    "committer": {"name": "GitHub", "date": "2021-04-26T13:15:48Z"},
    "message": "Initial commit",
  },
}]

const allReleasesNoData = {
  data: []
}

module.exports = {
  allCommitsData,
  allReleasesData,
  unreleasedCommitsData0,
  unreleasedCommitsData1,
  allReleasesNoData
}
