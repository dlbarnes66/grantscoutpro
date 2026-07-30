"use client";

export default function Error({ error, reset }) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Something went wrong.</h2>
      <pre className="text-red-600">{error.message}</pre>
      <button
        onClick={() => reset()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
