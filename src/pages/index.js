import React from "react"
import { Link, graphql } from "gatsby"
import { css } from "@emotion/core"
import Layout from "../components/layout"
import util from "../utils/util"
import Article from "../utils/article"
function renderIndexPage(data, category) {
  let articles = data.sort((l, r) => new Date(r.time) - new Date(l.time))
  if (category != "") {
    articles = articles.filter(a => a.category.includes(category))
  }
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

export default ({ data }) => {
  let category = ""
  const filterCategory = []
  // server side render
  if (typeof window != "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    category = urlParams.get("category") || ""
  }
  // in home page
  if (category === "") {
    filterCategory.push(
      ...data.site.siteMetadata.extraConfig.homePage.filterCategory
    )
  }
  const allArticles = data.allMarkdownRemark.edges
    .map(({ node }) => Article.fromMarkDownNode(node))
    .filter(([article, err]) => !err)
    .map(([article, err]) => article)
    .filter(article => article.id)
    .filter(article => {
      const duplicate = util.findUnionValues(article.category, filterCategory)
      return duplicate.length === 0
    })
    .filter(article => article.category.length != 0)

  return renderIndexPage(allArticles, category)
}

export const query = graphql`
  query {
    site {
      siteMetadata {
        extraConfig {
          homePage {
            filterCategory
          }
        }
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
`
