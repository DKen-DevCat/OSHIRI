// Oshiri Curve MVP - React + OpenAI API + DALL·E 3
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function OshiriCurveApp() {
  const [curveData, setCurveData] = useState(null);
  const [story, setStory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!curveData) return;
    setLoading(true);

    // 1. Send curve to OpenAI for story/background idea
    const storyRes = await fetch('/api/generate-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ curve: curveData })
    });
    const storyJson = await storyRes.json();
    setStory(storyJson.story);

    // 2. Send background prompt to OpenAI image API (DALL·E)
    const imageRes = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: storyJson.prompt })
    });
    const imageJson = await imageRes.json();
    setImageUrl(imageJson.imageUrl);

    setLoading(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">お尻曲線ジェネレーター</h1>

      {/* TODO: Replace with actual canvas or SVG curve input */}
      <textarea
        className="w-full h-24 border p-2 text-sm"
        placeholder="ここに曲線の特徴やカーブを記述（仮）"
        onChange={(e) => setCurveData(e.target.value)}
      />

      <Button onClick={handleGenerate} disabled={loading}>
        {loading ? '生成中...' : '生成する'}
      </Button>

      {story && <p className="text-sm italic">📖 {story}</p>}

      {imageUrl && (
        <img src={imageUrl} alt="背景" className="rounded-xl shadow-md" />
      )}
    </div>
  );
}
