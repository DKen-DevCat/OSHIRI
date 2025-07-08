// app/api/generate-story/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // bodyからpathとstrokeWidthを分割代入
    const { path, strokeWidth, totalLength, curveTightness, openingDirection, symmetry } = body.curve;

    if (!path || typeof path !== "string" || path.trim() === "") {
      return NextResponse.json(
        { message: "曲線のデータが有効ではありません。" },
        { status: 400 }
      );
    }

    const imagePromptCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
You are an artistic AI with a deep understanding of the beauty of the human form. The following SVG path is an abstract representation of the flow and contour of a woman’s lower body, specifically focusing on the waist, buttocks, and upper thighs, as seen from behind.

Please interpret the following input data to determine the pose, shape, and visual qualities of the female figure:

- Stroke width: ${strokeWidth} (thicker lines indicate fuller, rounder figures; thinner lines suggest a more delicate form)
- Total length of the curve: ${totalLength} pixels (longer curves imply more extended or dynamic poses)
- Curve tightness: ${curveTightness} (0 = straight, 1 = highly curved)
- Opening direction: ${openingDirection} (influences body orientation or twist)
- Symmetry: ${symmetry ? 'symmetrical' : 'asymmetrical'} (symmetrical curves imply a centered pose, asymmetrical suggests twisting or shifting)

Based on these parameters, generate a **detailed English prompt** for a Stable Diffusion model to create a **realistic or semi-realistic image** of a woman aged 20–39, shown from the back or side. The image must include:

- Her waist, buttocks, and thighs (calves optional)
- Her face must **not** be shown
- She may be nude (non-explicit), wearing a thong, or a skirt
- Lighting should highlight the contours of her body
- Style should be realistic, elegant, and sensual
- Skin tone can be any
- Focus on the essence of the female form inspired by the line’s flow

Do not include SVG or technical terms in the final prompt. Output only the image generation prompt, in English.
`

,
        },
      ],
      model: "gpt-3.5-turbo",
      max_tokens: 250,
      temperature: 0.8, // 多様性を出すために少し上げる
    });

    const imagePrompt = imagePromptCompletion.choices[0].message.content;
    if (!imagePrompt) {
      throw new Error("画像プロンプトの生成に失敗しました。");
    }

    return NextResponse.json({ prompt: imagePrompt });
  } catch (error: unknown) {
    console.error("プロンプト生成中にエラーが発生しました:", error);
    let errorMessage = "プロンプトの生成中に予期せぬエラーが発生しました。";

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