import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          BizFlow
        </h1>
        <p className="text-sm text-balance text-muted-foreground">
          Platform Manajemen Bisnis Terintegrasi
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
