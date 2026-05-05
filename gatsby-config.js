module.exports = {
  siteMetadata: {
    title: "Mean Log",
    description:
      "이상민의 AI 연구, 제품화, RAG, 문서 OCR, 운영형 AI 시스템 기록을 모으는 개인 기술 블로그입니다.",
    siteUrl: "https://d9249.github.io",
    author: "Sangmin Lee",
  },
  plugins: [
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "blog",
        path: `${__dirname}/content/blog`,
      },
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          "gatsby-remark-copy-linked-files",
          "gatsby-remark-responsive-iframe",
          "gatsby-remark-smartypants",
        ],
      },
    },
    "gatsby-plugin-sitemap",
  ],
};
