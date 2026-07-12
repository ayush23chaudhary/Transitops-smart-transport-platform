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

  const fillCredentials = (role: 'dispatcher' | 'fleet' | 'safety' | 'finance') => {
    const creds = {
      dispatcher: { email: 'dispatcher@transitops.com', password: 'dispatcher123' },
      fleet: { email: 'fleet@transitops.com', password: 'fleet123' },
      safety: { email: 'safety@transitops.com', password: 'safety123' },
      finance: { email: 'finance@transitops.com', password: 'finance123' },
    };
    setEmail(creds[role].email);
    setPassword(creds[role].password);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-white tracking-wider font-mono uppercase">
            Transit<span className="text-brand-500">Ops</span>
          </h2>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-mono">
            OPERATIONS CONTROL CONSOLE
          </p>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-800 text-red-300 text-xs px-4 py-3 rounded text-center font-mono uppercase font-semibold">
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
              className="w-full bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold py-2.5 rounded"
              isLoading={loading}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="text-xs border-t border-slate-800/80 pt-4 space-y-2">
          <p className="font-semibold text-slate-400 text-center font-mono uppercase tracking-wider text-xxs">Select Evaluator Role to Quick-Fill:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('dispatcher')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-2 rounded text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-xs text-slate-200">Dispatcher</div>
              <div className="text-xxs text-slate-500 font-mono">dispatcher@transitops.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('fleet')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-2 rounded text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-xs text-slate-200">Fleet Manager</div>
              <div className="text-xxs text-slate-500 font-mono">fleet@transitops.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('safety')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-2 rounded text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-xs text-slate-200">Safety Officer</div>
              <div className="text-xxs text-slate-500 font-mono">safety@transitops.com</div>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('finance')}
              className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 p-2 rounded text-left transition-colors cursor-pointer"
            >
              <div className="font-bold text-xs text-slate-200">Financial Analyst</div>
              <div className="text-xxs text-slate-500 font-mono">finance@transitops.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
