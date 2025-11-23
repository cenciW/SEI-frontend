'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_URL } from '@/lib/constants';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{email?: string; password?: string; name?: string}>({});
  const { login } = useAuth();

  // Heurística 2: Error Prevention - Validação em tempo real
  const validateEmail = (email: string) => {
    if (!email) return 'Email é obrigatório';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email inválido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'Senha é obrigatória';
    if (password.length < 6) return 'Senha deve ter no mínimo 6 caracteres';
    return '';
  };

  const validateName = (name: string) => {
    if (isRegister && !name) return 'Nome é obrigatório';
    return '';
  };

  // Heurística 8: Recognition Rather Than Recall - Indicador de força da senha
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '', color: '' };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: (strength / 5) * 100, label: 'Fraca', color: 'bg-red-500' };
    if (strength <= 3) return { strength: (strength / 5) * 100, label: 'Média', color: 'bg-yellow-500' };
    return { strength: (strength / 5) * 100, label: 'Forte', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Heurística 2: Error Prevention - Validação antes de enviar
    const errors = {
      email: validateEmail(email),
      password: validatePassword(password),
      name: validateName(name),
    };

    setValidationErrors(errors);

    if (errors.email || errors.password || (isRegister && errors.name)) {
      return;
    }

    setError('');
    setLoading(true);

    const endpoint = isRegister ? `${API_URL}/auth/register` : `${API_URL}/auth/login`;
    const body = isRegister ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Falha na autenticação');
      }

      const data = await res.json();
      
      if (isRegister) {
        // Heurística 1: Visibility of System Status - Feedback de sucesso
        setIsRegister(false);
        setError('');
        setPassword('');
        alert('✅ Registro realizado com sucesso! Faça login para continuar.');
      } else {
        login(data.access_token, data.user);
      }
    } catch (err: any) {
      // Heurística 9: Error Recognition and Recovery - Mensagens de erro claras
      setError(err.message || 'Erro ao autenticar. Verifique suas credenciais e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4 font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Heurística 4: Consistency and Standards - Título matching o sistema principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-2">
            Sistema Especialista de Irrigação
          </h1>
          <p className="text-slate-400">
            {isRegister ? 'Criar nova conta' : 'Acesse sua conta'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Heurística 3: User Control and Freedom - Toggle fácil entre login/register */}
            <div className="flex gap-2 p-1 bg-slate-950 rounded-lg">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`cursor-pointer flex-1 py-2 px-4 rounded-md transition-all ${
                  !isRegister
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`cursor-pointer flex-1 py-2 px-4 rounded-md transition-all ${
                  isRegister
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registrar
              </button>
            </div>

            {/* Name field - only for register */}
            {isRegister && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="name" className="text-slate-300">Nome</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setValidationErrors({...validationErrors, name: ''});
                  }}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500"
                  disabled={loading}
                />
                {validationErrors.name && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <span>⚠️</span> {validationErrors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setValidationErrors({...validationErrors, email: ''});
                }}
                className="bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500"
                disabled={loading}
                required
              />
              {validationErrors.email && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setValidationErrors({...validationErrors, password: ''});
                  }}
                  className="bg-slate-950 border-slate-800 text-slate-200 focus:border-blue-500 pr-10"
                  disabled={loading}
                  required
                />
                {/* Heurística 6: Help and Documentation - Toggle de visibilidade da senha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span>⚠️</span> {validationErrors.password}
                </p>
              )}
              
              {/* Password strength indicator for register */}
              {isRegister && password && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Força da senha:</span>
                    <span className={passwordStrength.strength > 60 ? 'text-green-400' : passwordStrength.strength > 40 ? 'text-yellow-400' : 'text-red-400'}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Heurística 9: Error Recognition and Recovery - Mensagens de erro claras */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-sm text-red-300 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-2">
                  <span className="text-lg">❌</span>
                  <div>
                    <p className="font-medium">Erro ao autenticar</p>
                    <p className="text-red-400">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Heurística 1: Visibility of System Status - Loading indicator */}
            <Button
              type="submit"
              className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-6 text-lg shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] disabled:active:scale-100"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isRegister ? 'Registrando...' : 'Entrando...'}</span>
                </div>
              ) : (
                <span>{isRegister ? 'Criar Conta' : 'Entrar'}</span>
              )}
            </Button>
          </form>

          {/* Heurística 10: Help and Documentation - Informações úteis */}
          <div className="mt-6 text-center text-sm text-slate-400">
            {isRegister ? (
              <p>
                Ao criar uma conta, você concorda com nossos termos de uso.
              </p>
            ) : (
              <p>
                Esqueceu sua senha? Entre em contato com o administrador.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
