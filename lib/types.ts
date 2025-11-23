// Core types for the irrigation system

export type CropType = "corn" | "tomato" | "wheat" | "lettuce" | "cannabis";
export type StageType = "seedling" | "vegetative" | "blooming";
export type SystemType = "drip" | "pivot" | "furrow";
export type GoalType = "balanced" | "vegetative" | "generative";
export type ApiStatus = "checking" | "online" | "offline" | null;

// Recommendation types
export interface PrologRecommendation {
  Need: "yes" | "no" | "maybe";
  Score: number;
  VolumeL: number | string;
  Advice?: string;
}

export interface AIRecommendation {
  shouldIrrigate: string;
  volumeL: number | string;
  advice?: string;
  cached?: boolean;
}

// Error Response Pattern types
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  details?: string[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: string[]
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export enum ErrorType {
  NETWORK = "network",
  VALIDATION = "validation",
  SERVER = "server",
  TIMEOUT = "timeout",
  UNKNOWN = "unknown",
}

export interface ErrorContext {
  type: ErrorType;
  message: string;
  userMessage: string;
}
