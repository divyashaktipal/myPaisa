import React from "react";

export interface BookmarkIconProps {
  className?: string;
  filled?: boolean;
}

export const BookmarkIcon: React.FC<BookmarkIconProps> = ({
  className = "w-4 h-4",
  filled = false,
}) => {
  if (filled) {
    return (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
        aria-hidden="true"
      >
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
};

export default BookmarkIcon;
