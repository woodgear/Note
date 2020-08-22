import React from "react"
import { css } from "@emotion/core"
import { StaticQuery, Link, graphql } from "gatsby"
import Article from "../utils/article"

//TODO 这些都是应该在插件中完成的
function pickCategory(allArticles) {
    const counter = {}
    for (const a of allArticles) {
        if (a.category.length != 0) {
            const rootCategory = a.category[0]
            const count = counter[rootCategory] || 0
            counter[rootCategory] = count + 1
        }
    }
    let ents = Object.entries(counter);
    ents.sort((a, b) => b[1] - a[1])
    return ents.slice(0, 6)
}

export default ({ children }) => (
    <StaticQuery
        query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }

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
    `}
        render={data => {
            const siteTitle = data.site.siteMetadata.title
            const allArticles = data.allMarkdownRemark.edges
                .map(({ node }) => Article.fromMarkDownNode(node))
                .filter(([article, err]) => !err)
                .map(([article, err]) => article)
                .filter((article) => article.id)
            const categories = pickCategory(allArticles)
            return (
                <div id="main"
                    css={css`
          margin: 0 auto;
          max-width: 80%;
        `}
                >
                    <div id="header"
                        css={css`
                        display:flex;
                        flex-direction: row;
                        justify-content:space-between;
                `}
                    >
                        <div id="title"
                            css={css`
                    `}
                        >
                            <Link to={`/`}>
                                <h3>  {siteTitle}
                                </h3>
                            </Link>
                        </div>
                        <div id="sub"
                            css={css`
                        display:flex;
                        flex-direction: row;
                        > * {
                            margin-right:10px;
                        }
                        `}
                        >
                            {
                                categories.map((c) => {
                                    const link = `/?category=${c[0]}`
                                    return (<Link to={link}>{c[0]}</Link>)
                                })
                            }
                            <div id="about">
                                <Link to={"/about"}>about</Link></div>
                        </div>
                    </div>
                    <div id="body"
                        css={css`
          margin: 0 auto;
          max-width: 80%;
       `
                        }

                    > {children} </div>
                </div>
            )
        }}
    />
)
