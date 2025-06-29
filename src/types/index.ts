export interface GenerateStoryResponse {
  story: string;
  prompt: string;
}

export interface GenerateImageResponse {
  imageUrl: string;
}

export interface ApiError {
  message: string;
}
