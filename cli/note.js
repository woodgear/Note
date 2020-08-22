#!/usr/bin/env node
const neodoc = require('neodoc');
const path = require('path');
const fs = require('fs')
const { exec, execSync, spawn, spawnSync } = require("child_process")
const randomId = require("random-id")
const mkdirp = require('mkdirp');
const dateFormat = require('dateformat');
const unified = require('unified')
const markdown = require('remark-parse')
var frontmatter = require('remark-frontmatter')
const jsYaml = require('js-yaml');
const util = require("./util")
const moment = require("moment-timezone")

// const doc = `
// usage:
//     note new  <PATH> [--mp] [--utt [--d|--s]] [--tag=TAG]
//     note fix <PATH> [--tmp]
//     note watch [--stop] [--log]
//     note deploy
// Arguments:
//   PATH  destination path
// Options:
// --mp  mutli file package without this option,will create a single file package
// --utt use time as title 
// --d  time format like YYYY-MM-DD
// --s  time format like YYYY-MM-DD-HH-MM-SS
// --tag=TAG  set tag 
// --tmp  to mutli packge covert single`

const doc = `
usage:
    note new  <PATH> [--mp] [--utt [--d|--s]] [--tag=TAG]
    note fix <PATH> [--tmp]
    note watch
    note deploy
    note build

Arguments:
  PATH  destination path
Options:
--mp  mutli file package without this option,will create a single file package
--utt use time as title 
--d  time format like YYYY-MM-DD
--s  time format like YYYY-MM-DD-HH-MM-SS
--tag=TAG  set tag 
--tmp  to mutli packge covert single`

function parseArgs(args) {
    const res = neodoc.run(doc, { argv: args, dontExit: true, help: true });
    return res;
}

function cmdNew(args) {
    const pathStr = args['<PATH>'];
    const useTimeAsTitle = args["--utt"] || false;
    const isMutliFilePackage = args['--mp'] || false;
    const tagStr = args["--tag"] || '';
    const tag = tagStr === '' ? [] : tagStr.split(',');
    const id = randomId(7).toLowerCase()
    const context = `---
id: ${id}
${tag.length === 0 ? '' : `tag: ${tag.join(',')}\n`}\
time: ${dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss')}
--- `;

    const isAbsolutePath = path.isAbsolute(pathStr);
    let fullPath = isAbsolutePath ? pathStr : path.normalize(path.join(process.cwd(), pathStr)); const pathObj = path.parse(fullPath);

    if (!isMutliFilePackage && useTimeAsTitle) {
        fullPath = path.format(pathObj);
        if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
            console.error(`when use time as time (--ust) ${fullPath} must be a directory but is not`)
            return
        }
        if (!fs.existsSync(fullPath)) {
            mkdirp.sync(fullPath);
        }
        let time = dateFormat(new Date(), 'yyyy-mm-dd');
        if (args['--s']) {
            time = dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss')
        }

        fullPath = `${fullPath}/${time}.md`;
        if (fs.existsSync(fullPath)) {
            console.error(`${fullPath} exists`)
            return
        }
        console.log(`create file ${fullPath}`)
        fs.writeFileSync(fullPath, context)
    }
    if (!isMutliFilePackage && !useTimeAsTitle) {
        const pathObj = path.parse(fullPath);
        if (pathObj.ext === '') {
            pathObj.ext = '.md';
            pathObj.base = `${pathObj.name}${pathObj.ext}`;
        }
        fullPath = path.format(pathObj);

        const isParentDirExists = fs.existsSync(pathObj.dir);
        //make sure path is unique and init dir
        if (isParentDirExists) {
            const parentPathStatus = fs.statSync(pathObj.dir);
            const parentPathisDir = parentPathStatus.isDirectory();
            if (!parentPathisDir) {
                console.error(`${pathObj.dir} is not a directory`)
                return;
            }
            if (fs.existsSync(fullPath)) {
                console.error(`${fullPath} has exists you could not create new one`)
                return
            }

        } else {
            console.log(`create diretory ${pathObj.dir}`)
            mkdirp.sync(pathObj.dir);
        }
        console.log(`create file ${fullPath}`)
        fs.writeFileSync(fullPath, context)
    }
    if (isMutliFilePackage && !useTimeAsTitle) {
        console.log('isMutliFilePackage')
        const pathObj = path.parse(fullPath);
        const isParentDirExists = fs.existsSync(pathObj.dir);
        //make sure path is unique and init dir
        if (isParentDirExists) {
            const parentPathStatus = fs.statSync(pathObj.dir);
            const parentPathisDir = parentPathStatus.isDirectory();
            if (!parentPathisDir) {
                console.error(`${pathObj.dir} is not a directory`)
                return;
            }
            if (fs.existsSync(fullPath)) {
                console.error(`${fullPath} has exists you could not create new one`)
                return
            }
        } else {
            console.log(`create diretory ${pathObj.dir}`)
            mkdirp.sync(pathObj.dir);
        }
        if (!fs.existsSync(fullPath)) {
            console.log("create mp diretory", fullPath)
            mkdirp.sync(fullPath);
            contextFullPath = path.join(fullPath, "main.md")
            fs.writeFileSync(contextFullPath, context)
        }
    }
}


function cmdFix(args) {
    let mdpath = args["<PATH>"]
    if (!fs.existsSync(mdpath)) {
        path = path.join(process.cwd(), path);
        if (!fs.existsSync(path)) {
            console.error(`sorry but ${path} not exists`);
            process.exit(-1)
        }
    }

    if (path.extname(mdpath) !== '.md') {
        console.log(`sorry but ${mdpath} is not a md file`);
        return;
    }
    const rawMd = fs.readFileSync(mdpath, 'utf8');
    const [config, _] = pickConfigFromMd(rawMd)
    const state = fs.statSync(mdpath)
    const oldestTime = util.minTime([state.atime, state.mtime, state.ctime, state.birthtime])

    if (config["time"]) {
        if (typeof config["time"] != "string") {
            const time = moment.tz(config["time"], "Asia/Shanghai").format()
            config.time = time
        }
        const time = new Date(config["time"])
        if (isNaN(time)) {
            const time = moment(config["time"], "YYYY-MM-DD-HH-mm-ss").format();
            console.log(mdpath, time, typeof time);
            config.time = time
        }
    }

    if (!config["time"]) {
        config.time = moment.tz(oldestTime, "Asia/Shanghai").format()
    }

    if (!config["id"]) {
        console.log('update id??');
        config.id = randomId(7).toLowerCase()
    } else {
        config.id = `${config.id}`
    }


    const newMd = upsertConfig(rawMd, config);
    fs.writeFileSync(mdpath, newMd);
}

function cmdWatch(args) {
    const cwd = process.cwd()
    const noteConfigPath = path.join(cwd, ".note.config.json")
    if (fs.existsSync(noteConfigPath)) {
        let noteConfig = JSON.parse(fs.readFileSync(noteConfigPath))
        noteConfig.blog.path = cwd
        const noteBinPath = path.normalize(path.join(__dirname, "../"))
        const noteBinConfigPath = path.join(noteBinPath, "config.json")
        fs.writeFileSync(noteBinConfigPath, JSON.stringify(noteConfig))
        console.log("start watch", noteBinPath)
        const gatsby = exec(`npm run develop`, { cwd: noteBinPath })
        gatsby.stdout.pipe(process.stdout)
        gatsby.stderr.pipe(process.stderr)
        gatsby.on("error", function (err) {
            console.log("gatsby error", err)
        })
    } else {
        console.error("could not find .note.config.json under cwd ", cwd)
    }
}


function cmdDeploy(args) {
    callGatsby("deploy")
}

function cmdBuild() {
    callGatsby("build")
}

function callGatsby(cmd) {
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
        const gatsby = exec(`npm run ${cmd}`, { cwd: noteBinPath })
        gatsby.stdout.pipe(process.stdout)
        gatsby.stderr.pipe(process.stderr)
        gatsby.on("error", function (err) {
            console.log("gatsby error", err)
        })
    } else {
        console.error("could not find .note.config.json under cwd ", cwd)
    }
}

const cmdMatchMap = {
    "new": cmdNew,
    "fix": cmdFix,
    "watch": cmdWatch,
    "deploy": cmdDeploy,
    "build":cmdBuild,
};

function main() {
    const args = parseArgs(process.argv.slice(2));
    for (const [key, cmd] of Object.entries(cmdMatchMap)) {
        if (args[key]) {
            cmd(args)
            return
        }
    }
}

function pickConfigFromMd(rawMd) {
    const processor = unified().use(markdown, { commonmark: true }).use(frontmatter, ['yaml'])
    const ast = processor.parse(rawMd);
    return pickConfigFromMdAst(ast)
}

// return config and the offset of the end of config
function pickConfigFromMdAst(ast) {
    if (!!!ast) {
        return [{}, 0]
    }
    if (!!!ast.children[0]) {
        return [{}, 0]
    }
    if (ast.children[0].type !== "yaml") {
        return [{}, 0]
    }
    return [jsYaml.safeLoad(ast.children[0].value), ast.children[0].position.end.offset];
}

function upsertConfig(rawMd, config) {
    const processor = unified().use(markdown, { commonmark: true }).use(frontmatter, ['yaml'])
    const ast = processor.parse(rawMd);
    const [_, offset] = pickConfigFromMdAst(ast);
    const mdConfig = jsYaml.safeDump(config);
    const mdWithoutConfig = rawMd.slice(offset).trim();
    const fixedMd = `---\n${mdConfig}---\n\n` + mdWithoutConfig;
    return fixedMd
}

function addIdInMd(rawMd, id) {
    const mdId = id || randomId(7).toLowerCase();
    const [config, offset] = pickConfigFromMd(rawMd);

    // if has id donothing
    if (!!!config.id) {
        config["id"] = mdId;
    }
    return upsertConfig(rawMd, config)
}

if (require.main === module) {
    main();
}

module.exports = { parseArgs, addIdInMd }