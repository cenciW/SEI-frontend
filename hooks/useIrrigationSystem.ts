import { useState } from "react";
import {
  CropType,
  StageType,
  SystemType,
  GoalType,
  ApiStatus,
  PrologRecommendation,
  AIRecommendation,
  ApiError,
} from "@/lib/types";
import { API_URL, NOTIFICATION_TIMEOUTS } from "@/lib/constants";
import { validateInputs } from "@/lib/validation";
import {
  handleError,
  parseApiError,
  showNotification,
} from "@/lib/error-handler";
import {
  updateSensor,
  updateContext,
  updateStage,
  updateAdvanced,
} from "@/lib/api";

export const useIrrigationSystem = () => {
  // Sensor and field configuration state
  const [location, setLocation] = useState<string>("field1");
  const [crop, setCrop] = useState<CropType>("corn");
  const [moisture, setMoisture] = useState<string>("50");
  const [rain, setRain] = useState<string>("0");
  const [temp, setTemp] = useState<string>("25");
  const [humidity, setHumidity] = useState<string>("60");
  const [isPot, setIsPot] = useState<boolean>(false);
  const [potSize, setPotSize] = useState<string>("10");
  const [stage, setStage] = useState<StageType>("vegetative");
  const [week, setWeek] = useState<string>("1");

  // Advanced parameters state
  const [ec, setEc] = useState<string>("1.5");
  const [system, setSystem] = useState<SystemType>("drip");
  const [goal, setGoal] = useState<GoalType>("balanced");

  // Results and UI state
  const [recommendation, setRecommendation] =
    useState<PrologRecommendation | null>(null);
  const [aiRecommendation, setAiRecommendation] =
    useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>(null);

  const handleAnalyze = async (): Promise<void> => {
    // Heurística 5: Prevenção de erros - validar antes de enviar
    const validationError = validateInputs(
      moisture,
      rain,
      temp,
      humidity,
      potSize,
      isPot
    );

    if (validationError) {
      showNotification(
        setError,
        validationError,
        NOTIFICATION_TIMEOUTS.VALIDATION_ERROR
      );
      return;
    }

    // Reset state
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    setAiLoading(true);
    setApiStatus("checking");

    try {
      // Update backend state in parallel
      await Promise.all([
        updateContext(location, isPot, potSize),
        updateStage(location, stage, week),
        updateAdvanced(location, ec, system, goal),
        updateSensor(location, "soil_moisture_pct", parseFloat(moisture)),
        updateSensor(location, "rain_last_24h_mm", parseFloat(rain)),
        updateSensor(location, "air_temperature_c", parseFloat(temp)),
        updateSensor(location, "relative_humidity_pct", parseFloat(humidity)),
      ]);

      // Build query params for AI
      const aiParams = new URLSearchParams({
        crop,
        location,
        moisture,
        temp,
        humidity,
        rain,
        stage,
        week,
        isPot: isPot.toString(),
        ...(isPot && { potSize }),
        ...(ec && { ec }),
        ...(system && { system }),
        ...(goal && { goal }),
      });

      // Fetch recommendations in parallel
      const [prologRes, aiRes] = await Promise.all([
        fetch(
          `${API_URL}/agents/recommendation?crop=${crop}&location=${location}`
        ),
        fetch(`${API_URL}/agents/ai-recommendation?${aiParams.toString()}`),
      ]);

      // Validate and parse Prolog response
      if (!prologRes.ok) {
        const prologError = await parseApiError(prologRes);
        console.error("Prolog API Error:", prologError);
        throw prologError;
      }

      const contentType = prologRes.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new ApiError("Resposta do Prolog não é JSON.", prologRes.status);
      }

      const prologData = (await prologRes.json()) as PrologRecommendation;
      setRecommendation(prologData);
      setLoading(false);

      // Validate and parse AI response
      if (!aiRes.ok) {
        const aiError = await parseApiError(aiRes);
        console.error("AI API Error:", aiError);
        throw aiError;
      }

      const aiData = (await aiRes.json()) as AIRecommendation;
      setAiRecommendation(aiData);
      setAiLoading(false);

      // Heurística 1: Feedback de sucesso
      setApiStatus("online");
      showNotification(
        setSuccessMessage,
        "Análise concluída com sucesso!",
        NOTIFICATION_TIMEOUTS.SUCCESS
      );
    } catch (error) {
      console.error("Failed to get recommendations:", error);

      // Heurística 9: Mensagens de erro claras e acionáveis com Error Response Pattern
      setApiStatus("offline");

      const errorContext = handleError(error);

      // Log error details for debugging
      console.error("Error Context:", {
        type: errorContext.type,
        message: errorContext.message,
        originalError: error,
      });

      showNotification(
        setError,
        errorContext.userMessage,
        NOTIFICATION_TIMEOUTS.ERROR
      );

      setLoading(false);
      setAiLoading(false);
    }
  };

  return {
    // State
    location,
    crop,
    moisture,
    rain,
    temp,
    humidity,
    isPot,
    potSize,
    stage,
    week,
    ec,
    system,
    goal,
    recommendation,
    aiRecommendation,
    loading,
    aiLoading,
    error,
    successMessage,
    apiStatus,
    // Setters
    setLocation,
    setCrop,
    setMoisture,
    setRain,
    setTemp,
    setHumidity,
    setIsPot,
    setPotSize,
    setStage,
    setWeek,
    setEc,
    setSystem,
    setGoal,
    setError,
    // Actions
    handleAnalyze,
  };
};
