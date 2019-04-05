import React from "react"
import { Link, graphql } from "gatsby"
import { css } from "@emotion/core"
import Layout from "../components/layout"

export default ({ data }) => {
  const articles = data.allMarkdownRemark

  return (
    <Layout>
      <div>
        <h4>{articles.totalCount} Posts</h4>
        {articles.edges.map(({ node }) => {
          const fileNode = node.parent
          return (
            <div key={node.id}>
              <Link
                to={node.fields.slug}
                css={css`
                  text-decoration: none;
                  color: inherit;
                `}
              >
                <h3>
                  {fileNode.name}
                  <span
                    css={css`
                      color: #bbb;
                    `}
                  >
                    — {fileNode.changeTime}
                  </span>
                </h3>
              </Link>
            </div>
          )
        })}
      </div>
    </Layout>
  )
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
          parent {
            ... on File {
              mtime
              birthtimeMs
              absolutePath
              name
              changeTime
            }
          }
        }
      }
    }
  }
`
