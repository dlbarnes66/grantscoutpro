"use client"

export function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" {...props}>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3.1l3 2.3c1.8-1.7 2.8-4.2 2.8-7.1 0-.6-.1-1.2-.2-1.8H12z"
      />
      <path
        fill="#34A853"
        d="M12 21c2.4 0 4.4-.8 5.9-2.2l-3-2.3c-.8.5-1.8.8-2.9.8-2.2 0-4.1-1.5-4.8-3.6l-3.1 2.4C5.2 19.3 8.4 21 12 21z"
      />
      <path
        fill="#FBBC05"
        d="M7.2 13.7c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2l-3.1-2.4C3.4 8.4 3 9.7 3 11c0 1.3.4 2.6 1.1 3.7l3.1-2.4z"
      />
      <path
        fill="#4285F4"
        d="M12 7.2c1.3 0 2.4.4 3.3 1.2l2.5-2.5C16.4 4.8 14.4 4 12 4 8.4 4 5.2 5.7 3.7 8.3l3.1 2.4C7.9 8.7 9.8 7.2 12 7.2z"
      />
    </svg>
  );
}

export function MicrosoftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 23 23" {...props}>
      <rect width="10" height="10" x="1" y="1" fill="#F25022" />
      <rect width="10" height="10" x="12" y="1" fill="#7FBA00" />
      <rect width="10" height="10" x="1" y="12" fill="#00A4EF" />
      <rect width="10" height="10" x="12" y="12" fill="#FFB900" />
    </svg>
  );
}
