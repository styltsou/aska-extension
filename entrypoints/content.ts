export type CapturedPage = {
  title: string;
  url: string;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

function metaContent(selector: string): string | null {
  return document.querySelector<HTMLMetaElement>(selector)?.content.trim() || null;
}

function absoluteUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    return new URL(value, document.baseURI).toString();
  } catch {
    return null;
  }
}

function capturePage(): CapturedPage {
  const canonical =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
  const description =
    metaContent('meta[property="og:description"]') ??
    metaContent('meta[name="description"]') ??
    metaContent('meta[name="twitter:description"]');
  const imageUrl = absoluteUrl(
    metaContent('meta[property="og:image"]') ??
      metaContent('meta[name="twitter:image"]'),
  );

  return {
    title:
      metaContent('meta[property="og:title"]') ??
      document.title.trim() ??
      new URL(location.href).hostname,
    url: canonical ?? location.href,
    description,
    imageUrl,
    siteName:
      metaContent('meta[property="og:site_name"]') ?? location.hostname,
  };
}

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_idle",
  main() {
    browser.runtime.onMessage.addListener((message: unknown) => {
      if (
        typeof message === "object" &&
        message !== null &&
        "type" in message &&
        message.type === "aska:capture-page"
      ) {
        return Promise.resolve(capturePage());
      }
    });
  },
});
