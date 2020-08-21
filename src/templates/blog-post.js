import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import { DiscussionEmbed } from 'disqus-react';

export default ({ data }) => {
    const node = data;
    const post = node.markdownRemark
    let { id, tag } = node.markdownRemark.frontmatter
    const disqusshotname = node.markdownRemark.fields.disqus.shortname
    const title = node.markdownRemark.frontmatter.title || node.markdownRemark.parent.name
    tag = tag || [];
    return (
        <Layout>
            <div>
                <h1>{title}</h1>
                <div dangerouslySetInnerHTML={{ __html: post.html }} />
                {renderDisqus(disqusshotname, id)}
            </div>
        </Layout>
    )
}

function renderDisqus(shortname, id) {
    if (shortname) {
        return (<DiscussionEmbed
            shortname={shortname}
            config={
                {
                    identifier: id,
                }
            }
        />)
    }
    return (<div />)
}

export const query = graphql`
query ($slug: String!) {
    markdownRemark(fields: {slug: {eq: $slug}}) {
      html
      fields {
        slug
        disqus {
              shortname
            }
      }
      frontmatter {
        id
        time
        tag
      }
      parent {
        ... on File {
          name
          ext
          birthTime
          changeTime
          relativeDirectory
          absolutePath
        }
      }
    }
  }
  
`
