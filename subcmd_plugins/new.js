const randomId = require("random-id")
const path = require("path")
const fs = require("fs")

const cmd_new = {
  is_match: () => {
    return process.argv[2] === "new"
  },
  do: () => {
    const aritcle_name = process.argv[3]
    const article_type = process.argv[4]
    console.log(aritcle_name, article_type)
    //如果没有指定创建类型的话 就生成默认的类型
    if (!aritcle_name) {
      console.error("you must give me a article name")
    }
    if (!article_type) {
      console.log(process.cwd())
      const target_file = path.join(process.cwd(), `${aritcle_name}.md`)
      const id = randomId(7).toLowerCase()
      const templete = `---
id: ${id}
---
`
      fs.writeFileSync(target_file, templete)
    }
  },
  help: () => {
    console.log("note new => will generate a formated markdown for you")
  },
}

module.exports = cmd_new
