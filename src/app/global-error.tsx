"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body className="p-6">
        <h2 className="text-xl font-bold mb-4">A global error occurred.</h2>
        <pre className="text-red-600">{error.message}</pre>
        <button
          onClick={() => reset()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Reload
        </button>
      </body>
    </html>
  );
}
