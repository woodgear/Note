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
create_time: ${dateFormat(new Date(), 'yyyy-mm-dd-HH-MM-ss')}
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
            console.log("create mp diretory",fullPath)
            mkdirp.sync(fullPath);
            contextFullPath = path.join(fullPath,"main.md")
            fs.writeFileSync(contextFullPath, context)
        }
    }
}

function cmdFix(args) {
    const abs_path  = path.join(process.cwd(),args["<PATH>"]);
    if (!fs.existsSync(abs_path)) {
        console.log(`sorry but ${abs_path} not exists`);
        return;
    }

    if (path.extname(abs_path)!=='.md') {
        console.log(`sorry but ${abs_path} is not a md file`);
        return;
    }
    const rawMd = fs.readFileSync(abs_path,'utf8');
    // console.log(rawMd)
    const newMd = addIdInMd(rawMd);
    fs.writeFileSync(abs_path,newMd);
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
        console.log("start watch",noteBinPath)
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

function pickConfigFromMdAst(ast) {
    if (!!!ast) {
        return [{},0]
    }
    if (!!!ast.children[0]) {
        return [{},0]
    }
    if (ast.children[0].type!=="yaml") {
        return [{},0]
    }
    console.log(ast);
    return  [jsYaml.safeLoad(ast.children[0].value),ast.children[0].position.end.offset];
}

function addIdInMd(rawMd,id) {
    const mdId = id|| randomId(7).toLowerCase();
    const processor = unified().use(markdown, {commonmark: true}).use(frontmatter, ['yaml'])
    const ast = processor.parse(rawMd);
    const [config,offset] = pickConfigFromMdAst(ast);

    // if has id donothing
    if (!!!config.id) {
        config["id"] = mdId;
    }
    console.log("offset",offset)
    const mdConfig = jsYaml.safeDump(config);
    console.log(typeof rawMd)
    const mdWithoutConfig = rawMd.slice(offset).trim();
    const fixedMd = `---\n${mdConfig}---\n\n`+mdWithoutConfig;
    return fixedMd
}

if (require.main === module) {
    main();
}

module.exports = { parseArgs,addIdInMd }