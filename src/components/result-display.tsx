import React, { JSX } from "react";

interface ResultDisplayProps {
  story: string | null;
  imageUrl: string | null;
}

export function ResultDisplay({
  story,
  imageUrl,
}: ResultDisplayProps): JSX.Element {
  return (
    <>
      {story && <p className="text-sm italic">📖 {story}</p>}

      {imageUrl && (
        <img src={imageUrl} alt="背景" className="rounded-xl shadow-md" />
      )}
    </>
  );
}
