export type IconName =
  | "dumbbell"
  | "user"
  | "users"
  | "star"
  | "heart"
  | "whatsapp"
  | "check"
  | "map-pin"
  | "clock";

const paths: Record<IconName, React.ReactNode> = {
  dumbbell: (
    <path
      d="M6.5 6.5v11M17.5 6.5v11M3 9.5h3M18 9.5h3M3 14.5h3M18 14.5h3M6.5 12h11"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M5 20c1.2-4 4-6 7-6s5.8 2 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19.5c1-3.4 3.4-5.2 5.5-5.2s4.5 1.8 5.5 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14.5 15c1.7.2 3.4 1.6 4.1 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  star: (
    <path
      d="M12 3.5l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  heart: (
    <path
      d="M12 20s-7-4.4-9.3-8.9C1.4 8 3 5 6.2 5c1.9 0 3.4 1 4.8 2.6C12.4 6 13.9 5 15.8 5 19 5 20.6 8 19.3 11.1 17 15.6 12 20 12 20Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  ),
  whatsapp: (
    <path
      d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.3A9 9 0 1 0 12 3Zm4.9 12.6c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.4-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4.2.5.7 1.7.7 1.9.1.2.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1l1.7.8c.2.1.4.2.4.3.1.2.1.7-.1 1.3Z"
      fill="currentColor"
    />
  ),
  check: <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />,
  "map-pin": (
    <>
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.5V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </>
  ),
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
