import {
  GenerateStoryResponse,
  GenerateImageResponse,
  ApiError,
} from "@/types";

const API_BASE_URL = "/api"; // Next.js API RoutesのベースURL

export async function generateStory(
  curve: string
): Promise<GenerateStoryResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ curve }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || "ストーリーの生成に失敗しました。");
  }
  return response.json();
}

export async function generateImage(
  prompt: string
): Promise<GenerateImageResponse> {
  const response = await fetch(`${API_BASE_URL}/generate-image`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData: ApiError = await response.json();
    throw new Error(errorData.message || "画像の生成に失敗しました。");
  }
  return response.json();
}
