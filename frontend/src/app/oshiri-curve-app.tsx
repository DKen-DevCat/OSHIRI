'use client';

import { OshiriCurveInput } from '@/components/oshiri-curve-input';
import { ResultDisplay } from '@/components/result-display';
import { Button } from '@/components/ui/button';
import { useOshiriCurveGenerator } from '@/hooks/use-oshiri-curve-generator';
import React, { JSX } from 'react';

export default function OshiriCurveApp(): JSX.Element {
  const {
    curveData,
    setCurveData,
    imageUrl,
    loading,
    error,
    generateContent,
  } = useOshiriCurveGenerator();

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">お尻曲線ジェネレーター</h1>

      <OshiriCurveInput onCurveDataChange={setCurveData} />

      <Button onClick={generateContent} disabled={loading || !curveData}>
        {loading ? '生成中...' : '生成する'}
      </Button>

      {error && <p className="text-red-500 text-sm">エラー: {error}</p>}

      {/* storyプロパティを渡さないように修正 */}
      <ResultDisplay imageUrl={imageUrl} />
    </div>
  );
}