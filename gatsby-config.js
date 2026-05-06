module.exports = {
  siteMetadata: {
    title: "ideal",
    description:
      "이상민의 연구 개발 기록을 모으는 개인 기술 블로그입니다.",
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
