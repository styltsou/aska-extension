export default function App() {
  return (
    <main className="popup">
      <div className="brand">aska</div>
      <h1>Save this page to your Inbox</h1>
      <p>
        Aska will save the current page through the same link flow as pasting
        its URL into your Inbox.
      </p>
      <button className="save-button" disabled type="button">
        Save to Inbox
      </button>
      <p className="status">
        Secure Aska sign-in is being added before saving is enabled.
      </p>
    </main>
  );
}
