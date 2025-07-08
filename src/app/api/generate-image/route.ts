// app/api/generate-image/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai"; // OpenAIライブラリをインポート

// OpenAIクライアントを初期化
// APIキーは環境変数から安全に取得されます
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    // DALL-E 3 APIを呼び出して画像を生成
    const image = await openai.images.generate({
      model: "dall-e-3", // DALL-E 3 モデルを指定
      prompt: prompt,
      n: 1, // 生成する画像の数 (DALL-E 3は現状1枚のみ)
      size: "1024x1024", // 画像サイズ (DALL-E 3で利用可能なサイズ: "1024x1024", "1792x1024", "1024x1792")
      quality: "standard", // 画像の品質 ("standard" または "hd")
      response_format: "url", // レスポンス形式をURLにする
    });

    const imageUrl =
      image?.data && image.data.length > 0 ? image.data[0]?.url : undefined;
    if (!imageUrl) {
      throw new Error("画像のURLが取得できませんでした。");
    }

    // 生成された画像のURLをフロントエンドに返す
    return NextResponse.json({ imageUrl });
  } catch (error: unknown) {
    // ★ここを 'unknown' に変更
    console.error("画像生成中にエラーが発生しました:", error);
    // エラーの種類に応じてメッセージを調整
    let errorMessage = "画像の生成中に予期せぬエラーが発生しました。";

    // ★型ガードを追加して、errorの型を安全に絞り込む
    if (error instanceof Error) {
      errorMessage = error.message;
      // OpenAI SDKのエラーオブジェクトには `error.response` が直接ない場合があるため、
      // より頑健なチェックが必要です。例えば、エラーが特定のクラスのインスタンスであるかなど。
      // ここでは簡易的に `message` を利用します。
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
    ) {
      // オブジェクトで 'message' プロパティを持つ場合
      errorMessage = (error as { message: string }).message;
    }
    // OpenAI SDKからの特定のエラータイプを処理したい場合は、
    // `OpenAI.APIError` などの型で `instanceof` を使うことも検討できます。
    // 例: if (error instanceof OpenAI.APIError) { ... }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
