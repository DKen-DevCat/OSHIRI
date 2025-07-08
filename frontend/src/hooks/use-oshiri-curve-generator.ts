'use client';

import { useState } from 'react';
import { generateImage, generatePrompt } from '@/searvices/api';
import { CurveDataObject } from '@/components/oshiri-curve-input';

export function useOshiriCurveGenerator() {
  const [curveData, setCurveData] = useState<CurveDataObject | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const generateContent = async () => {
    if (!curveData) return;

    setLoading(true);
    setError('');
    setImageUrl('');

    try {
      const { prompt } = await generatePrompt(curveData);
      const { imageUrl } = await generateImage(prompt);
      setImageUrl(imageUrl);
    } catch (err: unknown) { // `any`を`unknown`に変更
      // エラーがErrorインスタンスか確認し、メッセージを安全に取得
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('コンテンツの生成中に予期せぬエラーが発生しました。');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    curveData,
    setCurveData,
    imageUrl,
    loading,
    error,
    generateContent,
  };
}