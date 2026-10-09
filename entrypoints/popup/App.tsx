import { ArrowUpRight, BookmarkPlus, LockKeyhole } from "lucide-react";

const isConnected = false;

export default function App() {
  return (
    <main className="popup min-w-0">
      <header className="popup-header flex items-center justify-between">
        <span className="brand-logo">
          <img
            alt="Aska"
            className="brand-mark brand-mark-light"
            src="/aska-logo.svg"
          />
          <img
            alt=""
            aria-hidden="true"
            className="brand-mark brand-mark-dark"
            src="/aska-logo-dark.svg"
          />
        </span>
        <span className="extension-badge inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="extension-badge-dot" />
          BROWSER EXTENSION
        </span>
      </header>

      <section aria-labelledby="popup-title" className="hero">
        <div aria-hidden="true" className="hero-icon">
          <BookmarkPlus size={18} strokeWidth={1.7} />
        </div>
        <h1 id="popup-title">Save this page</h1>
        <p>Add the page you’re viewing to your Aska Inbox and keep it close.</p>
      </section>

      <button
        className="save-button transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        disabled={!isConnected}
        type="button"
      >
        <BookmarkPlus aria-hidden="true" />
        <span>Save to Inbox</span>
      </button>

      {!isConnected ? (
        <p className="connection-note">
          <LockKeyhole aria-hidden="true" />
          Connect your Aska account to start saving.
        </p>
      ) : null}

      <footer className="popup-footer flex items-center justify-between">
        <span>Made for your visual workspace</span>
        <a
          className="inline-flex items-center gap-1"
          href="https://aska-app.styltsou.com"
          rel="noreferrer"
          target="_blank"
        >
          Open Aska
          <ArrowUpRight aria-hidden="true" size={12} />
        </a>
      </footer>
    </main>
  );
}
