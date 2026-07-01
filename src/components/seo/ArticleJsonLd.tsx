/**
 * ArticleJsonLd — renders Article schema.org structured data.
 *
 * Used on journal article pages for rich news/article results.
 */

interface ArticleJsonLdProps {
  title: string;
  description: string;
  author: string;
  publishedTime: string;
  modifiedTime?: string;
  image?: string;
  url: string;
}

export function ArticleJsonLd({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  url,
}: ArticleJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: "Aura Living",
    },
    datePublished: publishedTime,
    dateModified: modifiedTime ?? publishedTime,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    ...(image ? { image } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default ArticleJsonLd;
