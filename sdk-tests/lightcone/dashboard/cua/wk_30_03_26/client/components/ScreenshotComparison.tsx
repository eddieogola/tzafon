'use client';

import { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, Maximize2, X, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScreenshotComparisonProps {
  expectedPath: string;
  actualPath?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ScreenshotComparison({
  expectedPath,
  actualPath,
  title = 'Screenshot Comparison',
  description,
  className,
}: ScreenshotComparisonProps) {
  const [zoom, setZoom] = useState(100);
  const [showExpected, setShowExpected] = useState(true);
  const [showActual, setShowActual] = useState(true);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const hasActual = actualPath && actualPath !== '';

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className={cn('bg-white rounded-xl border shadow-sm', className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
            {description && (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4 text-gray-600" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[4rem] text-center">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4 text-gray-600" />
            </button>
            {zoom !== 100 && (
              <button
                onClick={handleResetZoom}
                className="px-3 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors text-xs font-medium text-gray-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Toggle Visibility Controls */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setShowExpected(!showExpected)}
            className={cn(
              'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
              showExpected
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-gray-50 border-gray-300 text-gray-600'
            )}
          >
            {showExpected ? <Eye className="h-4 w-4 inline mr-1" /> : <EyeOff className="h-4 w-4 inline mr-1" />}
            Expected
          </button>
          {hasActual && (
            <button
              onClick={() => setShowActual(!showActual)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                showActual
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : 'bg-gray-50 border-gray-300 text-gray-600'
              )}
            >
              {showActual ? <Eye className="h-4 w-4 inline mr-1" /> : <EyeOff className="h-4 w-4 inline mr-1" />}
              Actual
            </button>
          )}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-6">
        <div className={cn(
          'grid gap-6',
          hasActual ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
        )}>
          {/* Expected Screenshot */}
          {showExpected && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Expected Screenshot</h3>
                <span className="text-xs text-gray-500">{expectedPath.split('/').pop()}</span>
              </div>
              <div
                className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden group"
                style={{ minHeight: '300px' }}
              >
                <img
                  src={`/${expectedPath}`}
                  alt="Expected screenshot"
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom / 100})` }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center text-gray-400">
                            <svg class="h-16 w-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-sm">Image not available</p>
                            <p class="text-xs mt-1">${expectedPath}</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                <button
                  onClick={() => setFullscreenImage(expectedPath)}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
          )}

          {/* Actual Screenshot */}
          {hasActual && showActual && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Actual Screenshot</h3>
                <span className="text-xs text-gray-500">{actualPath.split('/').pop()}</span>
              </div>
              <div
                className="relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg overflow-hidden group"
                style={{ minHeight: '300px' }}
              >
                <img
                  src={`/${actualPath}`}
                  alt="Actual screenshot"
                  className="w-full h-full object-contain transition-transform duration-200"
                  style={{ transform: `scale(${zoom / 100})` }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="absolute inset-0 flex items-center justify-center">
                          <div class="text-center text-gray-400">
                            <svg class="h-16 w-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p class="text-sm">Image not available</p>
                            <p class="text-xs mt-1">${actualPath}</p>
                          </div>
                        </div>
                      `;
                    }
                  }}
                />
                <button
                  onClick={() => setFullscreenImage(actualPath)}
                  className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  title="View fullscreen"
                >
                  <Maximize2 className="h-4 w-4 text-gray-700" />
                </button>
              </div>
            </div>
          )}

          {!hasActual && (
            <div className="col-span-1 lg:col-span-2">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  No actual screenshot available for comparison. This may be expected if the task hasn&apos;t generated a final screenshot yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setFullscreenImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            onClick={() => setFullscreenImage(null)}
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={`/${fullscreenImage}`}
            alt="Fullscreen view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
