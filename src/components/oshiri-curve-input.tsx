import React, { JSX } from "react";

interface OshiriCurveInputProps {
  onCurveDataChange: (data: string) => void;
}

export function OshiriCurveInput({
  onCurveDataChange,
}: OshiriCurveInputProps): JSX.Element {
  return (
    <textarea
      className="w-full h-24 border p-2 text-sm"
      placeholder="ここに曲線の特徴やカーブを記述（仮）"
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
        onCurveDataChange(e.target.value)
      }
    />
  );
}
