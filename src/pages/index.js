import React from "react"
import { Link, graphql } from "gatsby"
import { css } from "@emotion/core"
import Layout from "../components/layout"
import util from "../utils/util"
class Article {
    constructor(data) {
        Object.assign(this, data)
    }

    static fromMarkDownNode(node) {
        const { name, birthTime, changeTime, relativeDirectory } = node.parent
        let { id, time, tag } = node.frontmatter
        tag = tag || []
        const directories =
            relativeDirectory.split("\\").filter(s => s.length) || []
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

    static renderIndexPage(data) {
        const articles = data.sort(
            (l, r) => new Date(r.time) - new Date(l.time)
        )

        return (
            <Layout>
                <div>
                    <h4>{articles.length} Posts</h4>
                    {articles.map(article => {
                        return (
                            <div key={article.node.id}>
                                <Link
                                    to={article.node.fields.slug}
                                    css={css`
                    text-decoration: none;
                  `}
                                >
                                    <div
                                        className="article"
                                        css={css`
                      margin-bottom: 10px;
                    `}
                                    >
                                        <div
                                            className="category"
                                            css={css`
                        color: black;
                      `}
                                        >
                                            category: {article.category.join("->")}
                                        </div>
                                        <div className="title">
                                            <span
                                                css={css`
                          font-size: 150%;
                        `}
                                            >
                                                {article.title}
                                            </span>
                                            <span
                                                css={css`
                          font-size: 100%;
                        `}
                                            >
                                                -{util.timeAgo(article.time, new Date())}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </Layout>
        )
    }
}

export default ({ data }) => {
    const allArticles = data.allMarkdownRemark.edges
        .map(({ node }) => Article.fromMarkDownNode(node))
        .filter(([article, err]) => !err)
        .map(([article, err]) => article)
        .filter((article) => article.id)
    return Article.renderIndexPage(allArticles)
}

export const query = graphql`
  query {
    allMarkdownRemark {
      totalCount
      edges {
        node {
          id
          fields {
            slug
          }
          frontmatter {
            title
            tag
            time
            id
          }

          parent {
            ... on File {
              name
              ext
              birthTime
              changeTime
              relativeDirectory
            }
          }
        }
      }
    }
  }
`
