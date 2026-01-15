'use client';

import { LoginForm } from '@/components/auth/login-form';
import { PinLoginForm } from '@/components/auth/pin-login-form';
import { useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'pin'>('password');

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      {mode === 'password' ? (
        <LoginForm onSwitchToPin={() => setMode('pin')} />
      ) : (
        <PinLoginForm onSwitchToPassword={() => setMode('password')} />
      )}
    </div>
  );
}
