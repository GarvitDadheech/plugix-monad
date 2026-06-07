'use client';

import { useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export default function MCPLoginPage() {
  const router = useRouter();
  const { ready, authenticated, login, user } = usePrivy();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!ready) return;

    // If not authenticated, show login
    if (!authenticated) {
      return;
    }

    // User is authenticated, generate and display token
    const generateToken = async () => {
      setIsGenerating(true);
      try {
        const response = await fetch('/api/mcp/token', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ userId: user?.id })
        });

        if (!response.ok) {
          setError('Failed to generate token');
          return;
        }

        const data = await response.json();
        setToken(data.token);
      } catch (err) {
        setError('Error generating token: ' + String(err));
      } finally {
        setIsGenerating(false);
      }
    };

    generateToken();
  }, [ready, authenticated, user?.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-slate-700 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6">MCP Authentication</h1>

        {!ready ? (
          <div className="text-slate-300 text-center">Loading...</div>
        ) : !authenticated ? (
          <div>
            <p className="text-slate-300 mb-4">
              You need to log in with Privy to authenticate with MCP.
            </p>
            <button
              onClick={() => login()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
            >
              Sign in with Privy
            </button>
          </div>
        ) : isGenerating ? (
          <div className="text-slate-300 text-center">Generating token...</div>
        ) : token ? (
          <div>
            <p className="text-slate-300 mb-4">
              ✅ Authentication successful! Copy your access token and paste it into the MCP command:
            </p>
            <div className="bg-slate-800 rounded p-3 mb-4 break-all">
              <code className="text-green-400 text-sm font-mono">{token}</code>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(token);
                alert('Token copied to clipboard!');
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Copy Token
            </button>
            <p className="text-slate-400 text-sm mt-4">
              In MCP, run: <code className="bg-slate-800 px-2 py-1 rounded">x402_set_token(&lt;paste-token&gt;)</code>
            </p>
          </div>
        ) : error ? (
          <div className="text-red-400">
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
