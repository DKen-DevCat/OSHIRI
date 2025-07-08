"use client";

import { useState, useCallback } from "react";

import { GenerateStoryResponse, GenerateImageResponse } from "@/types";
import { generateImage, generateStory } from "@/searvices/api";

interface UseOshiriCurveGeneratorResult {
  curveData: string | null;
  setCurveData: (data: string) => void;
  story: string | null;
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
  generateContent: () => Promise<void>;
}

export function useOshiriCurveGenerator(): UseOshiriCurveGeneratorResult {
  const [curveData, setCurveData] = useState<string | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = useCallback(async () => {
    if (!curveData) {
      setError("曲線のデータが入力されていません。");
      return;
    }

    setLoading(true);
    setError(null);
    setStory(null);
    setImageUrl(null);

    try {
      // 1. Send curve to OpenAI for story/background idea
      const storyResult: GenerateStoryResponse = await generateStory(curveData);
      setStory(storyResult.story);

      // 2. Send curveDataをpromptとして画像生成APIに渡す
      const imageResult: GenerateImageResponse = await generateImage(curveData);
      setImageUrl(imageResult.imageUrl);
    } catch (err: unknown) {
      // エラーの型を unknown とし、型ガードで対応
      console.error("生成中にエラーが発生しました:", err);
      if (err instanceof Error) {
        setError(err.message || "コンテンツの生成に失敗しました。");
      } else {
        setError("コンテンツの生成に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  }, [curveData]);

  return {
    curveData,
    setCurveData,
    story,
    imageUrl,
    loading,
    error,
    generateContent,
  };
}
