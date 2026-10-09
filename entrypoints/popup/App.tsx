import { useEffect, useState } from "react";

const API_URL = "https://aska-api.styltsou.com";
const APP_URL = "https://aska-app.styltsou.com";
const CREDENTIAL_KEY = "aska-credential";
const PENDING_CONNECTION_KEY = "aska-pending-connection";

type PendingConnection = {
  requestId: string;
  secret: string;
  expiresAt: string;
};

type Credential = {
  apiKey: string;
};

type ApiResponse<T> = {
  data: T;
};

async function post<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(payload?.error?.message ?? "Could not connect to Aska.");
  }

  return ((await response.json()) as ApiResponse<T>).data;
}

export default function App() {
  const [credential, setCredential] = useState<Credential | null>(null);
  const [pending, setPending] = useState<PendingConnection | null>(null);
  const [status, setStatus] = useState<"loading" | "idle" | "connecting">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadState();
  }, []);

  async function loadState() {
    const stored = await browser.storage.local.get([
      CREDENTIAL_KEY,
      PENDING_CONNECTION_KEY,
    ]);

    setCredential((stored[CREDENTIAL_KEY] as Credential | undefined) ?? null);
    setPending(
      (stored[PENDING_CONNECTION_KEY] as PendingConnection | undefined) ?? null,
    );
    setStatus("idle");
  }

  async function startConnection() {
    setError(null);
    setStatus("connecting");

    try {
      const connection = await post<PendingConnection>(
        "/api/v1/extension/auth/requests",
      );
      await browser.storage.local.set({
        [PENDING_CONNECTION_KEY]: connection,
      });
      setPending(connection);

      const url = new URL("/extension/connect", APP_URL);
      url.searchParams.set("request", connection.requestId);
      url.searchParams.set("secret", connection.secret);
      await browser.tabs.create({ url: url.toString() });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not start the connection.",
      );
    } finally {
      setStatus("idle");
    }
  }

  async function finishConnection() {
    if (!pending) return;

    setError(null);
    setStatus("connecting");

    try {
      const credential = await post<Credential>(
        `/api/v1/extension/auth/requests/${pending.requestId}/exchange`,
        { secret: pending.secret },
      );

      await browser.storage.local.set({ [CREDENTIAL_KEY]: credential });
      await browser.storage.local.remove(PENDING_CONNECTION_KEY);
      setCredential(credential);
      setPending(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not finish the connection.",
      );
    } finally {
      setStatus("idle");
    }
  }

  if (status === "loading") {
    return <main className="popup">Loading…</main>;
  }

  if (credential) {
    return (
      <main className="popup">
        <div className="brand">aska</div>
        <h1>Connected</h1>
        <p>Your browser extension can now securely access your Aska account.</p>
      </main>
    );
  }

  return (
    <main className="popup">
      <div className="brand">aska</div>
      <h1>Connect your Aska account</h1>
      <p>Approve the connection in Aska, then return here.</p>
      <div className="actions">
        {pending ? (
          <>
            <button
              disabled={status === "connecting"}
              onClick={() => void finishConnection()}
              type="button"
            >
              {status === "connecting" ? "Checking…" : "Finish connecting"}
            </button>
            <button
              className="secondary"
              disabled={status === "connecting"}
              onClick={() => void startConnection()}
              type="button"
            >
              Start again
            </button>
          </>
        ) : (
          <button
            disabled={status === "connecting"}
            onClick={() => void startConnection()}
            type="button"
          >
            {status === "connecting" ? "Opening Aska…" : "Connect Aska"}
          </button>
        )}
      </div>
      {error ? <p className="error" role="alert">{error}</p> : null}
    </main>
  );
}
