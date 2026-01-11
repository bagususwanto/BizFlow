'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (!isAuthenticated || isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Memuat...</p>
        <style jsx>{`
          .loading-container {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            background: #0f172a;
            color: #94a3b8;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #1e293b;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__brand">
          <svg
            width="32"
            height="32"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="48" height="48" rx="12" fill="url(#logo-gradient)" />
            <path d="M14 16h20v4H18v6h12v4H18v6h16v4H14V16z" fill="white" />
            <defs>
              <linearGradient
                id="logo-gradient"
                x1="0"
                y1="0"
                x2="48"
                y2="48"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4F46E5" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
          </svg>
          <h1>BizFlow</h1>
        </div>
        <div className="dashboard__user">
          <div className="dashboard__user-info">
            <span className="dashboard__user-name">{user?.name}</span>
            <span className="dashboard__user-role">{user?.role}</span>
          </div>
          <button onClick={logout} className="dashboard__logout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M7.5 17.5H4.167A1.667 1.667 0 012.5 15.833V4.167A1.667 1.667 0 014.167 2.5H7.5M13.333 14.167L17.5 10l-4.167-4.167M17.5 10H7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        <h2>Dashboard</h2>
        <p className="dashboard__welcome">
          Selamat datang kembali, <strong>{user?.name}</strong>!
        </p>

        <div className="dashboard__cards">
          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 22V12h6v10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Point of Sale</h3>
            <p>Kelola transaksi penjualan</p>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Produk</h3>
            <p>Kelola katalog produk</p>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 12h-4l-3 9L9 3l-3 9H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3>Laporan</h3>
            <p>Lihat laporan penjualan</p>
          </div>

          <div className="dashboard__card">
            <div className="dashboard__card-icon dashboard__card-icon--orange">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h3>Pengaturan</h3>
            <p>Konfigurasi sistem</p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: #0f172a;
          color: #e2e8f0;
        }

        .dashboard__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 2rem;
          background: rgba(30, 41, 59, 0.8);
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
          backdrop-filter: blur(12px);
        }

        .dashboard__brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .dashboard__brand h1 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: white;
        }

        .dashboard__user {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .dashboard__user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .dashboard__user-name {
          font-weight: 500;
          color: white;
        }

        .dashboard__user-role {
          font-size: 0.75rem;
          color: #94a3b8;
          text-transform: capitalize;
        }

        .dashboard__logout {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 0.5rem;
          color: #f87171;
          font-size: 0.875rem;
          cursor: pointer;
          transition: background 0.2s;
        }

        .dashboard__logout:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .dashboard__main {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard__main h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
          color: white;
        }

        .dashboard__welcome {
          color: #94a3b8;
          margin: 0 0 2rem;
        }

        .dashboard__cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .dashboard__card {
          padding: 1.5rem;
          background: rgba(30, 41, 59, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 1rem;
          cursor: pointer;
          transition:
            transform 0.2s,
            border-color 0.2s;
        }

        .dashboard__card:hover {
          transform: translateY(-2px);
          border-color: rgba(79, 70, 229, 0.3);
        }

        .dashboard__card h3 {
          margin: 1rem 0 0.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: white;
        }

        .dashboard__card p {
          margin: 0;
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .dashboard__card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
        }

        .dashboard__card-icon--blue {
          background: rgba(59, 130, 246, 0.15);
          color: #60a5fa;
        }

        .dashboard__card-icon--green {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
        }

        .dashboard__card-icon--purple {
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
        }

        .dashboard__card-icon--orange {
          background: rgba(249, 115, 22, 0.15);
          color: #fb923c;
        }
      `}</style>
    </div>
  );
}
