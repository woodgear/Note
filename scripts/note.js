#!/usr/bin/env node
const process = require("process")
const path = require("path")
const fs = require("fs")
const { exec, execSync, spawn, spawnSync } = require("child_process")
const { docopt } = require("docopt")
const doc = `
usage: note watch
       note deploy
`

function run(cmd) {
    
  if (cmd.watch) {
    const cwd = process.cwd()
    const noteConfigPath = path.join(cwd, ".note.config.json")
    if (fs.existsSync(noteConfigPath)) {
      let noteConfig = JSON.parse(fs.readFileSync(noteConfigPath))
      noteConfig.blog.path = cwd
      const noteBinPath = path.normalize(path.join(__dirname, "../"))
      const noteBinConfigPath = path.join(noteBinPath, "config.json")
      fs.writeFileSync(noteBinConfigPath, JSON.stringify(noteConfig))
      console.log("start watch")
      const gatsby = exec(`npm run develop`, { cwd: noteBinPath })
      gatsby.stdout.pipe(process.stdout)
      gatsby.stderr.pipe(process.stderr)
      gatsby.on("error", function(err) {
        console.log("gatsby error", err)
      })
    } else {
      console.error("could not find .note.config.json under cwd ", cwd)
    }
  }
  if (cmd.deploy) {
    const cwd = process.cwd()
    const noteConfigPath = path.join(cwd, ".note.config.json")
    if (fs.existsSync(noteConfigPath)) {
      let noteConfig = JSON.parse(fs.readFileSync(noteConfigPath))
      noteConfig.blog.path = cwd
      if (!noteConfig.deploy || !noteConfig.deploy.gitrepo) {
        console.error("could not deploy cause of could not find git repo")
      }
      const noteBinPath = path.normalize(path.join(__dirname, "../"))
      const noteBinConfigPath = path.join(noteBinPath, "config.json")
      fs.writeFileSync(noteBinConfigPath, JSON.stringify(noteConfig))
      console.log("start deploy")
      const gatsby = exec(`npm run deploy`, { cwd: noteBinPath })
      gatsby.stdout.pipe(process.stdout)
      gatsby.stderr.pipe(process.stderr)
      gatsby.on("error", function(err) {
        console.log("gatsby error", err)
      })
    } else {
      console.error("could not find .note.config.json under cwd ", cwd)
    }
  }
}

run(docopt(doc))
