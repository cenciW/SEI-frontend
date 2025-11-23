"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import CropVisualization from "@/components/CropVisualization";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types for recommendations
interface PrologRecommendation {
  Need: "yes" | "no" | "maybe";
  Score: number;
  VolumeL: number | string;
  Advice?: string;
}

interface AIRecommendation {
  shouldIrrigate: string;
  volumeL: number | string;
  advice?: string;
  cached?: boolean;
}

// Heurística 9: Ajudar usuários a reconhecer, diagnosticar e recuperar de erros
const showError = (message: string) => {
  return message;
};

// Heurística 5: Prevenção de erros
const validateInputs = (
  moisture: string,
  rain: string,
  temp: string,
  humidity: string,
  potSize: string,
  isPot: boolean
): string | null => {
  const moistureNum = parseFloat(moisture);
  const rainNum = parseFloat(rain);
  const tempNum = parseFloat(temp);
  const humidityNum = parseFloat(humidity);

  if (isNaN(moistureNum) || moistureNum < 0 || moistureNum > 100) {
    return "Umidade do solo deve estar entre 0% e 100%";
  }
  if (isNaN(rainNum) || rainNum < 0) {
    return "Chuva não pode ser negativa";
  }
  if (isNaN(tempNum) || tempNum < -50 || tempNum > 60) {
    return "Temperatura deve estar entre -50°C e 60°C";
  }
  if (isNaN(humidityNum) || humidityNum < 0 || humidityNum > 100) {
    return "Umidade do ar deve estar entre 0% e 100%";
  }
  if (isPot) {
    const potSizeNum = parseFloat(potSize);
    if (isNaN(potSizeNum) || potSizeNum <= 0) {
      return "Tamanho do vaso deve ser maior que zero";
    }
  }
  return null;
};

export default function Home() {
  const [location, setLocation] = useState("field1");
  const [crop, setCrop] = useState("corn");
  const [moisture, setMoisture] = useState("50");
  const [rain, setRain] = useState("0");
  const [temp, setTemp] = useState("25");
  const [humidity, setHumidity] = useState("60");
  const [isPot, setIsPot] = useState(false);
  const [potSize, setPotSize] = useState("10");
  const [stage, setStage] = useState("vegetative");
  const [week, setWeek] = useState("1");
  const [ec, setEc] = useState("1.5");
  const [system, setSystem] = useState("drip");
  const [goal, setGoal] = useState("balanced");
  const [recommendation, setRecommendation] =
    useState<PrologRecommendation | null>(null);
  const [aiRecommendation, setAiRecommendation] =
    useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<
    "checking" | "online" | "offline" | null
  >(null);

  const updateSensor = async (type: string, value: number) => {
    try {
      await fetch(`${API_URL}/agents/sensor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, type, value }),
      });
    } catch (error) {
      console.error("Failed to update sensor", error);
    }
  };

  const updateContext = async () => {
    try {
      await fetch(`${API_URL}/agents/context`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          mode: isPot ? "pot" : "field",
          size: isPot ? parseFloat(potSize) : 0,
        }),
      });
    } catch (error) {
      console.error("Failed to update context", error);
    }
  };

  const updateStage = async () => {
    try {
      await fetch(`${API_URL}/agents/stage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          stage,
          week: parseInt(week),
        }),
      });
    } catch (error) {
      console.error("Failed to update stage", error);
    }
  };

  const updateAdvanced = async () => {
    try {
      await fetch(`${API_URL}/agents/advanced`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          ec: parseFloat(ec),
          system,
          goal,
        }),
      });
    } catch (error) {
      console.error("Failed to update advanced params", error);
    }
  };

  const handleAnalyze = async () => {
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
      setError(validationError);
      setTimeout(() => setError(null), 5000);
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    setAiLoading(true);

    try {
      // Heurística 1: Visibilidade do status do sistema
      setApiStatus("checking");

      // Update context first
      await updateContext();
      await updateStage();
      await updateAdvanced();

      // Update sensors with current values
      await updateSensor("soil_moisture_pct", parseFloat(moisture));
      await updateSensor("rain_last_24h_mm", parseFloat(rain));
      await updateSensor("air_temperature_c", parseFloat(temp));
      await updateSensor("relative_humidity_pct", parseFloat(humidity));

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
      });

      if (isPot) aiParams.append("potSize", potSize);
      if (ec) aiParams.append("ec", ec);
      if (system) aiParams.append("system", system);
      if (goal) aiParams.append("goal", goal);

      // Call both APIs in parallel
      const [prologRes, aiRes] = await Promise.all([
        fetch(
          `${API_URL}/agents/recommendation?crop=${crop}&location=${location}`
        ),
        fetch(`${API_URL}/agents/ai-recommendation?${aiParams.toString()}`),
      ]);

      // Check Prolog response
      if (!prologRes.ok) {
        throw new Error(`Prolog HTTP error! status: ${prologRes.status}`);
      }
      const contentType = prologRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Resposta do Prolog não é JSON.");
      }
      const prologData = await prologRes.json();
      setRecommendation(prologData);
      setLoading(false);

      // Check AI response
      if (!aiRes.ok) {
        throw new Error(`AI HTTP error! status: ${aiRes.status}`);
      }
      const aiData = await aiRes.json();
      setAiRecommendation(aiData);
      setAiLoading(false);

      // Heurística 1: Feedback de sucesso
      setApiStatus("online");
      setSuccessMessage("✓ Análise concluída com sucesso!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Failed to get recommendations", error);
      // Heurística 9: Mensagens de erro claras e acionáveis
      setApiStatus("offline");
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      setError(
        `Erro ao obter recomendações: ${errorMessage}. Por favor, verifique sua conexão e tente novamente.`
      );
      setTimeout(() => setError(null), 8000);
      setLoading(false);
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Heurística 1: Visibilidade do status do sistema */}
        {apiStatus && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border flex items-center gap-2 animate-in slide-in-from-top-5 ${
              apiStatus === "online"
                ? "bg-green-900/30 border-green-700 text-green-400"
                : apiStatus === "offline"
                ? "bg-red-900/30 border-red-700 text-red-400"
                : "bg-yellow-900/30 border-yellow-700 text-yellow-400"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                apiStatus === "online"
                  ? "bg-green-500 animate-pulse"
                  : apiStatus === "offline"
                  ? "bg-red-500"
                  : "bg-yellow-500 animate-pulse"
              }`}
            />
            <span className="text-sm font-medium">
              {apiStatus === "online"
                ? "API Online"
                : apiStatus === "offline"
                ? "API Offline"
                : "Verificando API..."}
            </span>
          </div>
        )}

        {/* Heurística 1: Feedback de sucesso */}
        {successMessage && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-900/90 border border-green-700 text-green-100 px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="font-medium">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Heurística 9: Mensagens de erro claras */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 border border-red-700 text-red-100 px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-top-5 backdrop-blur-sm max-w-md">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Erro</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 hover:bg-red-800/50 rounded p-1 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Sistema Especialista de Irrigação
          </h1>
          <p className="text-slate-400">Comparação: Prolog vs IA Generativa</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* SENSOR CARD */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-100">
                Leituras do Sensor
              </CardTitle>
              <CardDescription className="text-slate-400">
                Simular dados do sensor para o campo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* VISUALIZATION: POT MOISTURE & CROP */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Umidade do Solo</Label>
                  <div className="h-56 relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-end justify-center">
                    <div
                      className="w-full bg-blue-500/60 transition-all duration-1000 ease-out relative"
                      style={{ height: `${moisture}%` }}
                    >
                      <div className="absolute top-0 left-0 w-full h-2 bg-blue-400/80 animate-pulse" />
                      <div className="absolute w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white drop-shadow-md">
                        {moisture}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Visualização da Cultura
                  </Label>
                  <div className="h-56">
                    <CropVisualization
                      crop={crop}
                      mode={isPot ? "pot" : "field"}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  {/* Heurística 10: Ajuda e documentação */}
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">Localização</Label>
                    <div className="group relative">
                      <svg
                        className="w-4 h-4 text-slate-500 cursor-help"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="absolute left-0 top-6 hidden group-hover:block bg-slate-800 text-slate-200 text-xs rounded p-2 whitespace-nowrap z-50 border border-slate-700 shadow-lg">
                        Identificador único do campo/área
                      </div>
                    </div>
                  </div>
                  <Input
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: campo1, estufa-A"
                  />
                </div>
                <div className="space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <Label className="text-slate-300">Cultura</Label>
                    <div className="group relative">
                      <svg
                        className="w-4 h-4 text-slate-500 cursor-help"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="absolute left-0 top-6 hidden group-hover:block bg-slate-800 text-slate-200 text-xs rounded p-2 whitespace-nowrap z-50 border border-slate-700 shadow-lg">
                        Tipo de planta cultivada
                      </div>
                    </div>
                  </div>
                  <Select value={crop} onValueChange={setCrop}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200 z-50">
                      <SelectItem value="corn">Milho</SelectItem>
                      <SelectItem value="tomato">Tomate</SelectItem>
                      <SelectItem value="wheat">Trigo</SelectItem>
                      <SelectItem value="lettuce">Alface</SelectItem>
                      <SelectItem value="cannabis">Cannabis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Modo de Plantio</Label>
                <div className="flex items-center gap-2 border border-slate-800 bg-slate-950 p-3 rounded-md">
                  <input
                    type="checkbox"
                    id="potMode"
                    checked={isPot}
                    onChange={(e) => setIsPot(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <Label
                    htmlFor="potMode"
                    className="cursor-pointer text-slate-300"
                  >
                    Vaso
                  </Label>
                </div>
              </div>

              {isPot && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-slate-300">
                    Tamanho do Vaso (Litros)
                  </Label>
                  <Input
                    type="number"
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    value={potSize}
                    onChange={(e) => setPotSize(e.target.value)}
                    min="0"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Estágio</Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="seedling">Muda</SelectItem>
                      <SelectItem value="vegetative">Vegetativo</SelectItem>
                      <SelectItem value="blooming">Floração</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">
                    Semana (
                    {stage === "vegetative"
                      ? "V"
                      : stage === "seedling"
                      ? "S"
                      : "B"}
                    )
                  </Label>
                  <Input
                    type="number"
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                    min="1"
                  />
                </div>
              </div>

              {/* ADVANCED PARAMS BASED ON CROP */}
              {crop === "cannabis" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-slate-300">
                    EC (Condutividade Elétrica) atual do solo
                  </Label>
                  <Input
                    type="number"
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    value={ec}
                    onChange={(e) => setEc(e.target.value)}
                    step="0.1"
                  />
                </div>
              )}

              {crop === "tomato" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">
                      Meta de Crescimento
                    </Label>
                    <Select value={goal} onValueChange={setGoal}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="balanced">Balanceado</SelectItem>
                        <SelectItem value="vegetative">Vegetativo</SelectItem>
                        <SelectItem value="generative">Generativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">EC</Label>
                    <Input
                      type="number"
                      className="bg-slate-950 border-slate-800 text-slate-200"
                      value={ec}
                      onChange={(e) => setEc(e.target.value)}
                      step="0.1"
                    />
                  </div>
                </div>
              )}

              {(crop === "corn" || crop === "wheat") && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-slate-300">Sistema de Irrigação</Label>
                  <Select value={system} onValueChange={setSystem}>
                    <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                      <SelectItem value="drip">Gotejamento</SelectItem>
                      <SelectItem value="pivot">Pivô Central</SelectItem>
                      <SelectItem value="furrow">Sulco</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-300">Umidade do Solo (%)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <Input
                    type="number"
                    className="w-20 bg-slate-950 border-slate-800 text-slate-200"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">
                  Chuva nas últimas 24h (mm)
                </Label>
                <Input
                  type="number"
                  className="bg-slate-950 border-slate-800 text-slate-200"
                  value={rain}
                  onChange={(e) => setRain(e.target.value)}
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Temp. Ar (°C)</Label>
                  <Input
                    type="number"
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Umidade Ar (%)</Label>
                  <Input
                    type="number"
                    className="bg-slate-950 border-slate-800 text-slate-200"
                    value={humidity}
                    onChange={(e) => setHumidity(e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Heurística 1: Feedback visual durante ação */}
              <Button
                className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-6 text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:active:scale-100"
                onClick={handleAnalyze}
                disabled={loading || aiLoading}
              >
                {loading || aiLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analisando dados...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Analisar e Recomendar</span>
                  </div>
                )}
              </Button>

              {/* Heurística 10: Ajuda contextual */}
              <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 text-sm text-blue-300">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p>
                    <strong>Dica:</strong> Ajuste os valores dos sensores e
                    clique em analisar para obter recomendações personalizadas
                    de irrigação.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* RECOMMENDATION CARD */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-slate-100">Recomendação</CardTitle>
              <CardDescription className="text-slate-400">
                Decisão do sistema especialista
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {recommendation ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-400">
                        Irrigação Necessária?
                      </Label>
                      <div
                        className={`text-4xl font-black tracking-tight ${
                          recommendation.Need === "yes"
                            ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            : recommendation.Need === "maybe"
                            ? "text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                            : "text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        }`}
                      >
                        {recommendation.Need === "yes"
                          ? "SIM"
                          : recommendation.Need === "maybe"
                          ? "TALVEZ"
                          : "NÃO"}
                      </div>
                    </div>

                    {/* VISUALIZATION: IRRIGATION VOLUME */}
                    <div className="relative group">
                      <div className="w-24 h-32 bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden relative shadow-inner">
                        {/* Measurement Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-30 z-10 pointer-events-none">
                          <div className="w-full border-b border-slate-500"></div>
                          <div className="w-full border-b border-slate-500"></div>
                          <div className="w-full border-b border-slate-500"></div>
                          <div className="w-full border-b border-slate-500"></div>
                        </div>

                        {/* Water Fill */}
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-cyan-500/80 transition-all duration-1000 ease-out"
                          style={{
                            height: `${Math.min(
                              100,
                              ((typeof recommendation.VolumeL === "number"
                                ? recommendation.VolumeL
                                : 0) /
                                (isPot ? parseFloat(potSize) : 10)) *
                                100
                            )}%`,
                          }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-300 opacity-50 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-500 mt-2">
                        Volume
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label className="text-slate-300">
                        Pontuação de Irrigação
                      </Label>
                      <span className="text-slate-400 font-mono">
                        {recommendation.Score}/100
                      </span>
                    </div>
                    <Progress
                      value={recommendation.Score}
                      className="h-3 bg-slate-800"
                      indicatorClassName={
                        recommendation.Score > 60
                          ? "bg-red-500"
                          : recommendation.Score > 30
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Volume Sugerido</Label>
                    <div className="text-3xl font-mono bg-slate-950 border border-slate-800 p-4 rounded-lg text-cyan-400 text-center shadow-inner">
                      {(() => {
                        if (typeof recommendation.VolumeL !== "number")
                          return recommendation.VolumeL;
                        if (recommendation.VolumeL < 1) {
                          return (
                            <>
                              {Math.round(recommendation.VolumeL * 1000)}{" "}
                              <span className="text-lg text-slate-500">
                                {isPot ? "mL" : "mL/m²"}
                              </span>
                            </>
                          );
                        }
                        return (
                          <>
                            {parseFloat(recommendation.VolumeL.toFixed(3))}{" "}
                            <span className="text-lg text-slate-500">
                              {isPot ? "Litros" : "L/m²"}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {recommendation.Advice && (
                    <div className="bg-slate-800/50 border border-slate-700 p-3 rounded text-sm text-slate-300 italic whitespace-pre-line">
                      {recommendation.Advice}
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin"></div>
                  <p>Analisando dados...</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 p-6">
                  <svg
                    className="w-20 h-20 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-center space-y-2">
                    <p className="text-lg font-medium text-slate-400">
                      Pronto para analisar
                    </p>
                    <p className="text-sm text-slate-600">
                      Configure os sensores e clique em &quot;Analisar e
                      Recomendar&quot;
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI RECOMMENDATION CARD */}
          <Card className="bg-slate-900 border-slate-800 shadow-xl flex flex-col">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                Recomendação IA
                {aiRecommendation?.cached && (
                  <span className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-700">
                    Cache
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                IA Generativa (ChatGPT)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              {aiRecommendation ? (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-slate-400">
                        Irrigação Necessária?
                      </Label>
                      <div
                        className={`text-4xl font-black tracking-tight ${
                          aiRecommendation.shouldIrrigate === "SIM"
                            ? "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            : "text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                        }`}
                      >
                        {aiRecommendation.shouldIrrigate}
                      </div>
                    </div>

                    {/* VISUALIZATION: IRRIGATION VOLUME */}
                    <div className="relative group">
                      <div className="w-24 h-32 bg-slate-800 border-2 border-slate-700 rounded-lg overflow-hidden relative shadow-inner">
                        {/* Measurement Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-30 z-10 pointer-events-none">
                          <div className="w-full border-b border-slate-500"></div>
                          <div className="w-full border-b border-slate-500"></div>
                          <div className="w-full border-b border-slate-500"></div>
                          <div className="w-full border-b border-slate-500"></div>
                        </div>

                        {/* Water Fill */}
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-purple-500/80 transition-all duration-1000 ease-out"
                          style={{
                            height: `${Math.min(
                              100,
                              ((typeof aiRecommendation.volumeL === "number"
                                ? aiRecommendation.volumeL
                                : 0) /
                                (isPot ? parseFloat(potSize) : 10)) *
                                100
                            )}%`,
                          }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-purple-300 opacity-50 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="text-center text-xs text-slate-500 mt-2">
                        Volume
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Volume Sugerido</Label>
                    <div className="text-3xl font-mono bg-slate-950 border border-slate-800 p-4 rounded-lg text-purple-400 text-center shadow-inner">
                      {(() => {
                        if (typeof aiRecommendation.volumeL !== "number")
                          return aiRecommendation.volumeL;
                        if (aiRecommendation.volumeL < 1) {
                          return (
                            <>
                              {Math.round(aiRecommendation.volumeL * 1000)}{" "}
                              <span className="text-lg text-slate-500">
                                {isPot ? "mL" : "mL/m²"}
                              </span>
                            </>
                          );
                        }
                        return (
                          <>
                            {parseFloat(aiRecommendation.volumeL.toFixed(3))}{" "}
                            <span className="text-lg text-slate-500">
                              {isPot ? "Litros" : "L/m²"}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {aiRecommendation.advice && (
                    <div className="bg-slate-800/50 border border-slate-700 p-3 rounded text-sm text-slate-300 italic whitespace-pre-line">
                      {aiRecommendation.advice}
                    </div>
                  )}
                </div>
              ) : aiLoading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-700 border-t-purple-500 animate-spin"></div>
                  <p>Consultando IA...</p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <svg
                    className="w-20 h-20 text-slate-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <p className="text-lg font-medium">Aguardando análise...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
