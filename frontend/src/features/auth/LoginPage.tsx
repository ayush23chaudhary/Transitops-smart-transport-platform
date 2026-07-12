import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { authService } from './auth.service';
import type { UserSession } from './auth.types';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('dispatcher@transitops.com');
  const [password, setPassword] = useState('dispatcher123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user as UserSession));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
            TransitOps
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to the platform console
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500"
          />

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold py-2.5"
              isLoading={loading}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-xs text-slate-500 text-left border-t border-slate-800/80 pt-4 space-y-1">
          <p className="font-semibold text-slate-400 mb-1 text-center">Hackathon Roles & Credentials:</p>
          <p>• Dispatcher: <code className="text-brand-400">dispatcher@transitops.com</code> / <code className="text-brand-400">dispatcher123</code></p>
          <p>• Fleet Manager: <code className="text-brand-400">fleet@transitops.com</code> / <code className="text-brand-400">fleet123</code></p>
          <p>• Safety Officer: <code className="text-brand-400">safety@transitops.com</code> / <code className="text-brand-400">safety123</code></p>
          <p>• Financial Analyst: <code className="text-brand-400">finance@transitops.com</code> / <code className="text-brand-400">finance123</code></p>
        </div>
      </div>
    </div>
  );
};
