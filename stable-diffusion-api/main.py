# /Users/ken.sawada/OSHIRI/stable-diffusion-api/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from diffusers import StableDiffusionPipeline, DPMSolverMultistepScheduler
import torch
import base64
from io import BytesIO

app = FastAPI()

# モデルとLoRAのパスを設定
MODEL_PATH = "runwayml/stable-diffusion-v1-5"  # またはローカルのモデルパス
LORA_PATH = "/Users/ken.sawada/OSHIRI/stable-diffusion/kohya_ss/lora_train/outputs/last.safetensors"

# モデルをロード
# アプリケーション起動時に一度だけロードされるようにする
try:
    pipe = StableDiffusionPipeline.from_pretrained(MODEL_PATH, torch_dtype=torch.float16)
    pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
    pipe.load_lora_weights(LORA_PATH)
    pipe.to("mps") # Apple Silicon (M1/M2/M3) の場合
    # pipe.to("cuda") # NVIDIA GPUの場合
    # pipe.to("cpu") # CPUの場合
except Exception as e:
    print(f"モデルのロード中にエラーが発生しました: {e}")
    pipe = None # ロード失敗時はNoneを設定

class ImageGenerationRequest(BaseModel):
    prompt: str
    negative_prompt: str = ""
    num_inference_steps: int = 20
    guidance_scale: float = 7.5

@app.post("/generate-image")
async def generate_image(request: ImageGenerationRequest):
    if pipe is None:
        raise HTTPException(status_code=500, detail="Stable Diffusionモデルがロードされていません。")

    try:
        # 画像生成
        image = pipe(
            prompt=request.prompt,
            negative_prompt=request.negative_prompt,
            num_inference_steps=request.num_inference_steps,
            guidance_scale=request.guidance_scale
        ).images[0]

        # 画像をBase64エンコードして返す
        buffered = BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        return {"imageUrl": f"data:image/png;base64,{img_str}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"画像生成中にエラーが発生しました: {e}")
