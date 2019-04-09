#!/usr/bin/env node
const process = require("process")
const path = require("path")
const fs = require("fs")
const { exec, execSync, spawn, spawnSync } = require("child_process")
const cmd_new = require('../subcmd_plugins/new');

function run(cmds) {
  const cmd = cmds.find(e => e.is_match())
  if (cmd) {
    cmd.do()
  } else {
    console.log("could not find any cmd. you could find some cmd under blow")
    cmds.forEach(e => e.help())
  }
}

const cmd_watch = {
  is_match: () => {
    return process.argv[2] === "watch"
  },
  do: () => {
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
  },
  help: () => {
    console.log(
      "note watch => will start gatsby under current dir you could visit it on localhost:8000"
    )
  },
}

const cmd_deploy = {
  is_match: () => {
    return process.argv[2] === "deploy"
  },
  do: () => {
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
  },
  help: () => {
    console.log(
      "note deploy => will start gatsby deploy and upload the gatsby build result to github by you config under .note.config.json"
    )
  },
}

const cmds = [cmd_new, cmd_watch, cmd_deploy]

run(cmds)
