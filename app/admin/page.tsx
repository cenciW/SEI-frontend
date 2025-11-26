"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_URL } from "@/lib/constants";

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<string[]>([]);
  const [selectedModule, setSelectedModule] = useState("knowledge_base.pl");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
        return;
      }
      fetchModules();
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (selectedModule) {
      fetchModuleContent(selectedModule);
    }
  }, [selectedModule]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`${API_URL}/agents/prolog/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setModules(data.modules);
      } else {
        setStatus("Falha ao carregar lista de módulos");
      }
    } catch (err) {
      setStatus("Erro ao conectar com o servidor");
    }
  };

  const fetchModuleContent = async (modulePath: string) => {
    setLoading(true);
    setStatus("Carregando módulo...");
    try {
      const res = await fetch(
        `${API_URL}/agents/prolog/modules/${modulePath}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        setStatus("");
      } else {
        setStatus("Falha ao carregar módulo");
      }
    } catch (err) {
      setStatus("Erro ao carregar módulo");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setStatus("Salvando e validando...");
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/agents/prolog/modules/${selectedModule}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        setStatus("Módulo atualizado e validado com sucesso!");
        setTimeout(() => setStatus(""), 3000);
      } else {
        setStatus(`Erro: ${data.message || "Validação falhou"}`);
      }
    } catch (err) {
      setStatus("Erro de rede");
    } finally {
      setLoading(false);
    }
  };

  const getModuleDisplayName = (modulePath: string) => {
    if (modulePath === "knowledge_base.pl")
      return "Base de Conhecimento Principal";
    const fileName = modulePath.split("/").pop()?.replace(".pl", "") || "";
    const cropNames: Record<string, string> = {
      corn: "Milho",
      tomato: "Tomate",
      wheat: "Trigo",
      lettuce: "Alface",
      cannabis: "Cannabis",
    };
    return cropNames[fileName] || fileName;
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-slate-400 mt-2">
              Gerenciamento da Base de Conhecimento Prolog
            </p>
          </div>
          <Button
            className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            onClick={() => router.push("/")}
          >
            Voltar para o App
          </Button>
        </div>

        {/* Module Selector Card */}
        <Card className="bg-slate-900 border-slate-800 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-100 text-xl">
                Editor de Módulos Prolog
              </CardTitle>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-400">Módulo:</span>
                <Select
                  value={selectedModule}
                  onValueChange={setSelectedModule}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[320px] bg-slate-950 border-slate-800 text-slate-200 hover:border-blue-500 transition-colors">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                    {modules.map((module) => (
                      <SelectItem
                        key={module}
                        value={module}
                        className="hover:bg-slate-800 focus:bg-slate-800"
                      >
                        {getModuleDisplayName(module)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-300 mb-1">Dica:</p>
                <p className="text-sm text-blue-400/80">
                  Edite as regras Prolog abaixo. Ao clicar em &apos;Salvar e
                  Validar&apos;, o sistema tentará carregar as regras no motor
                  Prolog. Se houver erros de sintaxe, as alterações serão
                  rejeitadas.
                </p>
              </div>
            </div>

            {/* Editor */}
            <div className="relative">
              <textarea
                className="w-full h-[500px] p-4 font-mono text-sm bg-slate-950 text-green-400 rounded-lg border border-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                disabled={loading}
                placeholder="Carregando conteúdo do módulo..."
              />
              {loading && (
                <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-3 bg-slate-900 px-6 py-3 rounded-lg border border-slate-800">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-300">Carregando...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status and Save Button */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex-1">
                {status && (
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg animate-in fade-in slide-in-from-left-2 ${
                      status.toLowerCase().includes("sucesso")
                        ? "bg-green-900/20 border border-green-800/50 text-green-400"
                        : status.toLowerCase().includes("erro")
                        ? "bg-red-900/20 border border-red-800/50 text-red-400"
                        : "bg-slate-800/50 border border-slate-700 text-slate-400"
                    }`}
                  >
                    <span className="font-medium">{status}</span>
                  </div>
                )}
              </div>
              <Button
                className="cursor-pointer bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-8 py-6 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:active:scale-100"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <span>Salvar e Validar</span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Module Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-400 shrink-0 mt-0.5"
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
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-1">
                Sobre este módulo:
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {selectedModule === "knowledge_base.pl"
                  ? "Base de conhecimento principal que importa todos os módulos de culturas e define as regras gerais de irrigação."
                  : `Módulo específico para a cultura ${getModuleDisplayName(
                      selectedModule
                    )}. Contém regras especializadas para esta planta.`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
