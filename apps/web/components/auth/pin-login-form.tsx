'use client';

import * as React from 'react';
import { Loader2, ArrowLeft, Check, Delete } from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Avatar,
  AvatarFallback,
  CardFooter,
  cn,
} from '@bizflow/ui';
import { useUsersForPinQuery } from '@/hooks/use-auth-mutations';
import { usePinLoginMutation } from '@/hooks/use-pin-login-mutation';

interface PinLoginFormProps {
  onSwitchToPassword: () => void;
}

export function PinLoginForm({ onSwitchToPassword }: PinLoginFormProps) {
  const [selectedUser, setSelectedUser] = React.useState<{
    id: string;
    name: string;
    username: string;
  } | null>(null);
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const { data: users, isLoading: isLoadingUsers } = useUsersForPinQuery();
  const { mutate: login, isPending: isLoggingIn } = usePinLoginMutation();

  const handleUserSelect = (user: {
    id: string;
    name: string;
    username: string;
  }) => {
    setSelectedUser(user);
    setPin('');
    setError(null);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
    setPin('');
    setError(null);
  };

  const handlePinInput = (value: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + value);
      setError(null);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleSubmit = () => {
    if (!selectedUser || pin.length < 4) return;

    login(
      {
        userId: selectedUser.id,
        pin: pin,
      },
      {
        onError: (err) => {
          setError(err.message || 'PIN tidak valid');
          setPin(''); // Clear PIN on error
        },
      },
    );
  };

  React.useEffect(() => {
    if (pin.length === 6) {
      handleSubmit();
    }
  }, [pin]);

  // Render User Selection Step
  if (!selectedUser) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Pilih Akun</CardTitle>
          <CardDescription className="text-center">
            Pilih akun Anda untuk login cepat
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {users?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="flex flex-col items-center p-4 rounded-lg hover:bg-muted transition-colors border border-transparent hover:border-border"
                >
                  <Avatar className="h-16 w-16 mb-2">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-center line-clamp-1">
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground text-center line-clamp-1">
                    @{user.username}
                  </span>
                </button>
              ))}
              {users?.length === 0 && (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Tidak ada user yang mengaktifkan PIN login.
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={onSwitchToPassword}>
            Kembali ke Login Password
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Render PIN Entry Step
  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader>
        <div className="flex items-center absolute left-4 top-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToUsers}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center pt-4">
          <Avatar className="h-20 w-20 mb-4 border-2 border-background shadow-sm">
            <AvatarFallback className="text-xl bg-primary text-primary-foreground">
              {selectedUser.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <CardTitle>{selectedUser.name}</CardTitle>
          <CardDescription>@{selectedUser.username}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {/* PIN Display */}
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full transition-all duration-200',
                i < pin.length ? 'bg-primary scale-100' : 'bg-muted scale-90',
              )}
            />
          ))}
        </div>

        {error && (
          <div className="text-center text-destructive text-sm font-medium mb-4 animate-shake">
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-4 max-w-[240px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <Button
              key={num}
              variant="outline"
              className="h-14 w-14 text-xl font-semibold rounded-full border-muted-foreground/20 hover:border-primary hover:text-primary transition-all"
              onClick={() => handlePinInput(num.toString())}
              disabled={isLoggingIn}
            >
              {num}
            </Button>
          ))}
          <div /> {/* Spacer */}
          <Button
            variant="outline"
            className="h-14 w-14 text-xl font-semibold rounded-full border-muted-foreground/20 hover:border-primary hover:text-primary transition-all"
            onClick={() => handlePinInput('0')}
            disabled={isLoggingIn}
          >
            0
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-14 w-14 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isLoggingIn}
          >
            <Delete className="h-6 w-6" />
          </Button>
        </div>
      </CardContent>
      <CardFooter className="justify-center pb-6">
        {isLoggingIn && (
          <div className="flex items-center text-sm text-muted-foreground animate-pulse">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifikasi PIN...
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
