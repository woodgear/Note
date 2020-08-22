import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

export default ({ data }) => {
    const node = data;
    const post = node.markdownRemark
    return (
        <Layout>
            <div>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
        </Layout>
    )
}


export const query = graphql`
{
  allMarkdownRemark(
     filter: {
      frontmatter: {type: {eq: "about"}}
    }
  ) {
    edges {
      node {
        html,
        frontmatter {
          id
          type
        }
      }
    }
  }
}`
