const ghpages = require("gh-pages")
const config = require("../config.json")
const simpleGit = require("simple-git")

console.log(config.blog.path)
async function do_deploy() {
  await push_gh_pages()
  await push_git()
}

async function push_git() {
  const options = {
    baseDir: config.blog.path,
    binary: "git",
    maxConcurrentProcesses: 6,
  }

  const git = simpleGit(options)
  await git.init()
  const remotes = await git.getRemotes(true)
  if (remotes.length === 0) {
    await git.addRemote("origin", config.deploy.gitrepo)
  }
  if (
    remotes.length != 0 &&
    (remotes[0].name !== "origin" || remotes[0].name !== config.deploy.gitrepo)
  ) {
    await git.removeRemote(remotes[0].name)
    await git.addRemote("origin", config.deploy.gitrepo)
  }
  const status = await git.status()
  console.log("status", JSON.stringify(status, null, 4))
  if (status["current"] !== "blog") {
    console.log("start checkout")
    await git.checkoutLocalBranch("blog")
  } else {
    await git.pull("origin", "blog")
  }
  console.log("start add")
  await git.add("*")
  console.log("start commit")
  await git.commit(`update at ${now()}`)
  console.log("start push")
  await git.push("origin", "blog")
  console.log("push ok")
}

function now() {
  return Date.now().toString()
}
async function push_gh_pages() {
  return new Promise(resolve => {
    ghpages.publish(
      "public",
      {
        message: `update at ${now()}`,
        branch: "master",
        repo: config.deploy.gitrepo,
      },
      () => {
        resolve("deploy ok")
      }
    )
  })
}

do_deploy()
