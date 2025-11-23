"use client";

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
import {
  ApiStatusIndicator,
  Notification,
  VolumeVisualization,
  VolumeDisplay,
} from "@/components/IrrigationUI";
import { useIrrigationSystem } from "@/hooks/useIrrigationSystem";
import { CropType, StageType, SystemType, GoalType } from "@/lib/types";

export default function Home() {
  const {
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
  } = useIrrigationSystem();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Heurística 1: Visibilidade do status do sistema */}
        <ApiStatusIndicator apiStatus={apiStatus} />

        {/* Heurística 1: Feedback de sucesso */}
        <Notification message={successMessage} type="success" />

        {/* Heurística 9: Mensagens de erro claras */}
        <Notification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
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
                  <Select
                    value={crop}
                    onValueChange={(value) => setCrop(value as CropType)}
                  >
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
                  <Select
                    value={stage}
                    onValueChange={(value) => setStage(value as StageType)}
                  >
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
                    <Select
                      value={goal}
                      onValueChange={(value) => setGoal(value as GoalType)}
                    >
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
                  <Select
                    value={system}
                    onValueChange={(value) => setSystem(value as SystemType)}
                  >
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
                    className="w-5 h-5 shrink-0 mt-0.5"
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

                    <VolumeVisualization
                      volumeL={recommendation.VolumeL}
                      isPot={isPot}
                      potSize={potSize}
                      color="cyan"
                    />
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
                      <VolumeDisplay
                        volumeL={recommendation.VolumeL}
                        isPot={isPot}
                      />
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

                    <VolumeVisualization
                      volumeL={aiRecommendation.volumeL}
                      isPot={isPot}
                      potSize={potSize}
                      color="purple"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Volume Sugerido</Label>
                    <div className="text-3xl font-mono bg-slate-950 border border-slate-800 p-4 rounded-lg text-purple-400 text-center shadow-inner">
                      <VolumeDisplay
                        volumeL={aiRecommendation.volumeL}
                        isPot={isPot}
                      />
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
