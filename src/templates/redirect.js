import * as React from "react";

const RedirectPage = ({ pageContext }) => {
  React.useEffect(() => {
    window.location.replace(pageContext.to);
  }, [pageContext.to]);

  return (
    <main>
      <p>
        Redirecting to <a href={pageContext.to}>{pageContext.to}</a>
      </p>
    </main>
  );
};

export default RedirectPage;

export const Head = ({ pageContext }) => (
  <>
    <meta httpEquiv="refresh" content={`0;url=${pageContext.to}`} />
    <link rel="canonical" href={pageContext.to} />
    <title>Redirecting...</title>
  </>
);
