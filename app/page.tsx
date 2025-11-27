'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import StatusCard from '@/components/StatusCard';
import { ServiceStatus, ServiceName } from '@/lib/types';

const POLL_INTERVAL = 60 * 60 * 1000; // 1 hour

export default function Home() {
  const [services, setServices] = useState<Record<ServiceName, ServiceStatus> | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'degraded' | 'down'>('down');
  const [loading, setLoading] = useState(true);
  // removed unused historical/selection state to avoid lint/type warnings

  // Fetch current status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      const data = await response.json();

      setServices(data.services);
      setLastUpdate(new Date(data.lastUpdate));
      setOverallStatus(data.overallStatus);
      // nothing returned from fetcher — component renders
    } catch (err) {
      console.error('Failed to fetch status', err);
    } finally {
      setLoading(false);
    }
  };

  // Polling and initial fetch
  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  // Compute grouped service arrays for rendering
  const allServiceArray: ServiceStatus[] = Object.values(services ?? {});
  const infrastructure = allServiceArray.filter((s) => ['mongodb', 'redis'].includes(s.name));
  const backend = allServiceArray.filter((s) => ['orchestration', 'services', 'crons'].includes(s.name));
  const frontend = allServiceArray.filter((s) => ['frontend', 'careflick', 'hub'].includes(s.name));
  const llmService = allServiceArray.find((s) => s.name === 'llm');

  if (loading) {
    return (
      <ErrorBoundary>
        <main className='min-h-screen p-8'>
          <div className='flex flex-col items-center justify-center min-h-[80vh] gap-4'>
            <div className='animate-spin w-12 h-12 border-4 border-surface-light border-t-primary rounded-full' />
            <p className='text-text-secondary text-lg'>Loading status...</p>
          </div>
        </main>
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <main style={{ minHeight: '100vh', padding: '32px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <Header
            lastUpdate={lastUpdate}
            overallStatus={overallStatus}
          />

          {/* Services Grid */}
          <section style={{ marginBottom: '48px' }}>
          {/* Infrastructure */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text-primary)',
            }}
          >
            <span
              className='material-icons'
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              dns
            </span>
            Infrastructure
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {infrastructure.length === 0 && allServiceArray.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', padding: '12px' }}>No services available</div>
            ) : (
              infrastructure.map((service) => (
                <StatusCard
                  key={service.name}
                  service={service}
                />
              ))
            )}
          </div>

          {/* Backend Services */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text-primary)',
            }}
          >
            <span
              className='material-icons'
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              cloud
            </span>
            Backend Services
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {backend.map((service) => (
              <StatusCard
                key={service.name}
                service={service}
              />
            ))}
          </div>

          {/* Frontend */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text-primary)',
            }}
          >
            <span
              className='material-icons'
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              web
            </span>
            Frontend
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {frontend.map((service) => (
              <StatusCard
                key={service.name}
                service={service}
              />
            ))}
          </div>

          {/* LLM Services */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '16px',
              color: 'var(--text-primary)',
            }}
          >
            <span
              className='material-icons'
              style={{ verticalAlign: 'middle', marginRight: '8px' }}
            >
              psychology
            </span>
            LLM Services
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '32px',
            }}
          >
            {llmService ? (
              <StatusCard
                key='llm'
                service={llmService}
              />
            ) : null}
          </div>
        </section>
      </div>
      </main>
    </ErrorBoundary>
  );
}