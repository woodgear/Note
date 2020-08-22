class Article {
    constructor(data) {
        Object.assign(this, data)
    }

    static fromMarkDownNode(node) {
        const { name, birthTime, changeTime, relativeDirectory } = node.parent
        let { id, time, tag } = node.frontmatter
        tag = tag || []
        const regex = /(\/|\\)/gm;

        const directories =
            relativeDirectory.split(regex).filter(s => s.length!=0&& s!=`\\`&&s!=`\/`) || []
        const [title, category, err] = Article.parserNameAndCategory(
            directories,
            name,
            node.frontmatter.title
        )
        if (err) {
            console.error("fromMarkDownNode fail", node, err)
            return [null, "fromMarkDownNode fail"]
        }

        return [new Article({ title, category, id, time, tag, node }), null]
    }

    /*  
    directories:Vec<NotEmptyString>
    filenName:NotEmptyString,
    frontmatterTitle:Option<NotEmptyString>
    */

    // why i use go err handle? why? T_T
    static parserNameAndCategory(directories, fileName, frontmatterTitle) {
        if (!fileName || fileName.length === 0) {
            return [null, null, "fileName could not be empty"]
        }
        if (directories.length === 0 && fileName === "main") {
            return [
                null,
                null,
                "fileName could not be main when this file under root dir",
            ]
        }

        let title = null
        let category = []
        if (directories.length === 0) {
            title = fileName
            category = []
        } else if (
            directories[directories.length - 1] === fileName ||
            fileName === "main"
        ) {
            title = directories[directories.length - 1]
            category = directories.slice(0, -1)
        } else {
            title = fileName
            category = directories
        }
        if (frontmatterTitle) {
            title = frontmatterTitle
        }
        return [title, category, null]
    }

}
export default Article