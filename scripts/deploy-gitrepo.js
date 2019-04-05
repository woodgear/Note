const ghpages = require('gh-pages');
const config = require('../config.json');
ghpages.publish(
  'public',
  {
    branch: 'master',
    repo: config.deploy.gitrepo,
  },
  () => {
    console.log('Deploy Complete!')
  }
)
