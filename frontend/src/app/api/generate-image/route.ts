// app/api/generate-image/route.ts
import { NextResponse } from "next/server";
// import OpenAI from "openai"; // OpenAIライブラリは不要になるため削除

// OpenAIクライアントの初期化は不要になるため削除
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    // 入力検証
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { message: "画像プロンプトが有効ではありません。" },
        { status: 400 }
      );
    }

    // ローカルのStable Diffusion APIを呼び出して画像を生成
    const localApiUrl = "http://localhost:8000/generate-image"; // ローカルAPIのエンドポイント
    const apiResponse = await fetch(localApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        // 必要に応じて、negative_prompt, num_inference_steps, guidance_scale などを追加
        // negative_prompt: "bad anatomy, blurry, low quality",
        // num_inference_steps: 20,
        // guidance_scale: 7.5,
      }),
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.detail || "ローカルAPIからの応答が不正です。");
    }

    const data = await apiResponse.json();
    const imageUrl = data.imageUrl; // ローカルAPIはimageUrlを直接返す

    if (!imageUrl) {
      throw new Error("画像のURLが取得できませんでした。");
    }

    // 生成された画像のURLをフロントエンドに返す
    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    console.error("画像生成中にエラーが発生しました:", error);
    let errorMessage = "画像の生成中に予期せぬエラーが発生しました。";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      errorMessage = (error as { message: string }).message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
