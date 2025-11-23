import { API_URL } from "./constants";
import { ApiError } from "./types";
import { parseApiError } from "./error-handler";

// API helper function with Error Response Pattern
export const apiPost = async (
  endpoint: string,
  data: Record<string, unknown>
): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const apiError = await parseApiError(response);
      console.error(`API Error [${endpoint}]:`, {
        status: apiError.statusCode,
        message: apiError.message,
        details: apiError.details,
      });
      throw apiError;
    }
  } catch (error) {
    // Re-throw ApiError or wrap other errors
    if (error instanceof ApiError) {
      throw error;
    }
    console.error(`Failed to POST ${endpoint}:`, error);
    throw error;
  }
};

// Update sensor data
export const updateSensor = async (
  location: string,
  type: string,
  value: number
): Promise<void> => {
  await apiPost("/agents/sensor", { location, type, value });
};

// Update context (pot/field mode and size)
export const updateContext = async (
  location: string,
  isPot: boolean,
  potSize: string
): Promise<void> => {
  await apiPost("/agents/context", {
    location,
    mode: isPot ? "pot" : "field",
    size: isPot ? parseFloat(potSize) : 0,
  });
};

// Update growth stage
export const updateStage = async (
  location: string,
  stage: string,
  week: string
): Promise<void> => {
  await apiPost("/agents/stage", {
    location,
    stage,
    week: parseInt(week, 10),
  });
};

// Update advanced parameters
export const updateAdvanced = async (
  location: string,
  ec: string,
  system: string,
  goal: string
): Promise<void> => {
  await apiPost("/agents/advanced", {
    location,
    ec: parseFloat(ec),
    system,
    goal,
  });
};
