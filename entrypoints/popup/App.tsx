import { useEffect, useState } from "react";

type CapturedPage = {
  title: string;
  url: string;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
};

export default function App() {
  const [page, setPage] = useState<CapturedPage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void captureCurrentPage();
  }, []);

  async function captureCurrentPage() {
    setError(null);

    try {
      const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        throw new Error("Could not find the active page.");
      }

      const page = await browser.tabs.sendMessage<CapturedPage>(tab.id, {
        type: "aska:capture-page",
      });
      setPage(page);
    } catch {
      setError("Aska can’t capture this browser page.");
    }
  }

  if (error) {
    return (
      <main className="popup">
        <div className="brand">aska</div>
        <h1>Page unavailable</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!page) {
    return (
      <main className="popup">
        <div className="brand">aska</div>
        <p className="loading">Reading this page…</p>
      </main>
    );
  }

  return (
    <main className="popup">
      <div className="brand">aska</div>
      <article className="page-preview">
        {page.imageUrl ? (
          <img alt="" className="preview-image" src={page.imageUrl} />
        ) : (
          <div aria-hidden="true" className="preview-placeholder" />
        )}
        <div className="preview-content">
          <p className="site-name">{page.siteName}</p>
          <h1>{page.title}</h1>
          {page.description ? (
            <p className="description">{page.description}</p>
          ) : null}
          <p className="url">{page.url}</p>
        </div>
      </article>
      <button className="save-button" disabled type="button">
        Save to Aska
      </button>
      <p className="status">
        Connecting your Aska account securely is the next step.
      </p>
    </main>
  );
}
