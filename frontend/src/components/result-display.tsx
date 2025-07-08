'use client';

import Image from 'next/image'; // next/imageをインポート
import React, { JSX } from 'react';

interface ResultDisplayProps {
  imageUrl: string;
}

export function ResultDisplay({ imageUrl }: ResultDisplayProps): JSX.Element | null {
  if (!imageUrl) return null;

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">生成された画像</h2>
      <div className="relative flex justify-center aspect-square">
        {/* `<img>`を`<Image>`コンポーネントに置き換え */}
        <Image
          src={imageUrl}
          alt="生成された画像"
          fill
          className="rounded-lg shadow-md object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
    </div>
  );
}
