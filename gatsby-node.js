const { createFilePath } = require(`gatsby-source-filesystem`)
const path = require(`path`)
const fs = require("fs")
let noteConfig = null

function getConfig(mdPath) {
    if (noteConfig != null) {
        return noteConfig
    }
    const configPath = findConfigFile(mdPath);
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"))
    noteConfig = {
        disqus: config.disqus
    }
    return noteConfig
}

function findConfigFile(mdPath) {
    const p = path.dirname(mdPath)
    const configPath = path.join(p, ".note.config.json")
    if (fs.existsSync(configPath)) {
        return configPath
    }
    return findConfigFile(p)
}

exports.onCreateNode = ({ node, getNode, actions }) => {
    const { createNodeField } = actions
    if (node.internal.type === `MarkdownRemark`) {
        const noteConfig = getConfig(node.fileAbsolutePath)
        const slug = createFilePath({ node, getNode, basePath: `pages` })
        createNodeField({
            node,
            name: `slug`,
            value: slug,
        })
        createNodeField({
            node,
            name: `disqus`,
            value: noteConfig.disqus,
        })
    }
}


exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions

    return graphql(`
    {
      allMarkdownRemark {
        edges {
          node {
            fields {
              slug
              disqus {
                  shortname
              }
            }
          }
        }
      }
    }
  `
    ).then(result => {
        result.data.allMarkdownRemark.edges.forEach(({ node }) => {
            createPage({
                path: node.fields.slug,
                component: path.resolve(`./src/templates/blog-post.js`),
                context: {
                    slug: node.fields.slug,
                    disqus: node.fields.disqus
                },
            })
        })
    })
}