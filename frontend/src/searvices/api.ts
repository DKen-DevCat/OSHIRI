import { CurveDataObject } from "@/components/oshiri-curve-input";

// 曲線データから画像プロンプトを生成するAPI
export async function generatePrompt(
  curveData: CurveDataObject
): Promise<{ prompt: string }> {
  const response = await fetch("/api/generate-story", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ curve: curveData }), // curveDataオブジェクトを送信
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "画像プロンプトの生成に失敗しました。");
  }

  return response.json();
}

// プロンプトから画像を生成するAPI
export async function generateImage(
  prompt: string
): Promise<{ imageUrl: string }> {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "画像の生成に失敗しました。");
  }

  return response.json();
}