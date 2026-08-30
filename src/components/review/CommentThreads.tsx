"use client";

export default function CommentThreads({ threads, onReplyAction }) {
  return (
    <div className="space-y-4">
      {threads.map((t) => (
        <div key={t.id} className="p-4 border rounded-lg bg-white">
          <div className="flex items-center gap-2 mb-2">
            {t.authorAvatar && (
              <img
                src={t.authorAvatar}
                className="w-6 h-6 rounded-full"
                alt=""
              />
            )}
            <span className="text-sm font-medium">{t.author}</span>
            <span className="text-xs text-gray-500">
              {new Date(t.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-gray-800">{t.text}</p>

          <button
            className="text-blue-600 text-sm mt-2"
            onClick={() => onReplyAction(t.id)}
          >
            Reply
          </button>

          {t.replies?.length > 0 && (
            <div className="ml-6 mt-3 space-y-3">
              {t.replies.map((r) => (
                <div key={r.id} className="p-3 border rounded bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    {r.authorAvatar && (
                      <img
                        src={r.authorAvatar}
                        className="w-5 h-5 rounded-full"
                        alt=""
                      />
                    )}
                    <span className="text-xs font-medium">{r.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
