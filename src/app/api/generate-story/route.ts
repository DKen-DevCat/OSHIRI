// app/api/generate-story/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { curve } = body;

    if (!curve || typeof curve !== "string" || curve.trim() === "") {
      return NextResponse.json(
        { message: "曲線のデータが有効ではありません。" },
        { status: 400 }
      );
    }

    const storyCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `以下の曲線の特徴について、想像力を働かせて短い物語を生成してください。物語はポジティブで創造的な内容にしてください。:\n\n曲線: ${curve}`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.8,
    });

    const story = storyCompletion.choices[0].message.content;
    if (!story) {
      throw new Error("ストーリーの生成に失敗しました。");
    }

    const imagePromptCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `以下の日本語の物語に完全に一致する、DALL-E 3で最高の画像を生成するための詳細で具体的な英語のプロンプトを生成してください。プロンプトは最大500文字程度で、キーワードではなく、描写豊かな文章にしてください。\n\n物語: ${story}`,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 250,
      temperature: 0.7,
    });

    const imagePrompt = imagePromptCompletion.choices[0].message.content;
    if (!imagePrompt) {
      throw new Error("画像プロンプトの生成に失敗しました。");
    }

    return NextResponse.json({ story, prompt: imagePrompt });
  } catch (error: unknown) {
    // ★ここを 'unknown' に変更
    console.error("ストーリー生成中にエラーが発生しました:", error);
    let errorMessage = "ストーリーの生成中に予期せぬエラーが発生しました。";

    // ★型ガードを追加して、errorの型を安全に絞り込む
    if (error instanceof Error) {
      errorMessage = error.message;
      // OpenAI APIからのエラーの場合、さらに詳細な情報がある可能性
      // OpenAI SDKのエラーオブジェクトには `error.response` が直接ない場合があるため、
      // より頑健なチェックが必要です。例えば、エラーが特定のクラスのインスタンスであるかなど。
      // ここでは簡易的に `message` を利用します。
      // もしOpenAI APIのエラーレスポンスの形が分かっていれば、より具体的にアクセスできます。
    } else if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      // オブジェクトで 'message' プロパティを持つ場合
      errorMessage = (error as { message: string }).message;
    }

    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
