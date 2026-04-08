import { useState } from 'react';
import { 
  Activity, 
  Layers, 
  Settings, 
  Play, 
  Code, 
  Cpu, 
  Maximize2, 
  Database,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ImageUpload from './components/ImageUpload';
import { analyzeImages, AnalysisResult } from './services/gemini';

export default function App() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [parameterImages, setParameterImages] = useState<{
    mood?: string;
    context?: string;
    materials?: string;
    lighting?: string;
  }>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'json' | 'preview'>('json');

  const handleProcess = async () => {
    if (!referenceImage) {
      setError("Reference image is required.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const data = await analyzeImages(referenceImage, parameterImages);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please check your images and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-zinc-700 selection:text-white flex overflow-hidden">
      {/* Left Sidebar - Controls */}
      <aside className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/30 backdrop-blur-xl">
        <div className="p-6 border-bottom border-zinc-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-100 rounded flex items-center justify-center text-black">
            <Cpu size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">Visual Engine</h1>
            <p className="text-[10px] text-zinc-500 font-mono">v1.0.4-stable</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Reference Image */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Database size={14} />
              <h2 className="text-[10px] font-mono uppercase tracking-widest">Base Layer</h2>
            </div>
            <ImageUpload 
              id="ref-upload"
              label="Reference Image (Immutable)" 
              onImageSelect={(base64) => setReferenceImage(base64)} 
            />
          </section>

          {/* Parameter Layers */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-zinc-400">
              <Layers size={14} />
              <h2 className="text-[10px] font-mono uppercase tracking-widest">Parameter Layers</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ImageUpload 
                id="mood-upload"
                label="Mood" 
                onImageSelect={(base64) => setParameterImages(prev => ({ ...prev, mood: base64 || undefined }))} 
              />
              <ImageUpload 
                id="context-upload"
                label="Context" 
                onImageSelect={(base64) => setParameterImages(prev => ({ ...prev, context: base64 || undefined }))} 
              />
              <ImageUpload 
                id="materials-upload"
                label="Materials" 
                onImageSelect={(base64) => setParameterImages(prev => ({ ...prev, materials: base64 || undefined }))} 
              />
              <ImageUpload 
                id="lighting-upload"
                label="Lighting" 
                onImageSelect={(base64) => setParameterImages(prev => ({ ...prev, lighting: base64 || undefined }))} 
              />
            </div>
          </section>

          {/* Settings / Info */}
          <section className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>ENGINE STATUS</span>
              <span className="text-green-500 flex items-center gap-1">
                <Activity size={10} /> READY
              </span>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50 text-[10px] leading-relaxed text-zinc-400">
              Analysis preserves camera and geometry. Modifications applied to surface, light, and atmosphere only.
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button
            onClick={handleProcess}
            disabled={isProcessing || !referenceImage}
            className={`w-full py-3 rounded font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all
              ${isProcessing || !referenceImage 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-zinc-100 text-black hover:bg-white active:scale-[0.98]'}`}
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                Run Analysis
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content - Results */}
      <main className="flex-1 flex flex-col bg-black relative">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-900/20 backdrop-blur-md z-10">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('json')}
              className={`text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-2
                ${activeTab === 'json' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Code size={14} /> Output JSON
            </button>
            <button 
              onClick={() => setActiveTab('preview')}
              className={`text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-2
                ${activeTab === 'preview' ? 'text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Maximize2 size={14} /> Visual Summary
            </button>
          </div>

          <div className="flex items-center gap-4">
            {result && (
              <button 
                onClick={copyToClipboard}
                className="p-2 text-zinc-500 hover:text-zinc-100 transition-colors"
                title="Copy JSON"
              >
                <Copy size={16} />
              </button>
            )}
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
              <Settings size={14} />
              <span>CONFIG: PRECISE_MERGE</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {!result && !isProcessing && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 p-12 text-center"
              >
                <div className="w-16 h-16 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                  <Cpu size={32} className="opacity-20" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-2 uppercase tracking-widest">Engine Idle</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  Upload a reference image and optional parameter layers to begin reverse-engineering.
                </p>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20"
              >
                <div className="relative">
                  <Loader2 size={48} className="text-zinc-100 animate-spin opacity-20" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-zinc-100 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="mt-8 space-y-2 text-center">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-400">Analyzing Geometry</p>
                  <div className="w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-zinc-100"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-sm font-medium text-red-400 mb-2 uppercase tracking-widest">Analysis Error</h3>
                <p className="text-xs text-zinc-500 max-w-xs">{error}</p>
                <button 
                  onClick={handleProcess}
                  className="mt-6 text-[10px] font-mono uppercase tracking-widest text-zinc-100 hover:underline"
                >
                  Retry Operation
                </button>
              </motion.div>
            )}

            {result && activeTab === 'json' && (
              <motion.div 
                key="json-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full p-8 overflow-auto custom-scrollbar"
              >
                <div className="max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-green-500 text-[10px] font-mono uppercase tracking-widest">
                      <CheckCircle2 size={12} /> Analysis Complete
                    </div>
                    <span className="text-[10px] font-mono text-zinc-600">SESSION_ID: {result.session.id}</span>
                  </div>
                  <pre className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-lg text-xs font-mono leading-relaxed text-zinc-300 overflow-x-auto selection:bg-zinc-700">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </motion.div>
            )}

            {result && activeTab === 'preview' && (
              <motion.div 
                key="preview-result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-full p-8 overflow-auto custom-scrollbar"
              >
                <div className="max-w-4xl mx-auto space-y-12">
                  <div className="grid grid-cols-2 gap-12">
                    <section className="space-y-6">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 border-b border-zinc-800 pb-2">Base Geometry</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase">Architecture</span>
                          <span className="text-xs text-zinc-200">{result.base_image.geometry.architecture.style}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase">Form</span>
                          <span className="text-xs text-zinc-200">{result.base_image.geometry.architecture.form}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase">Camera</span>
                          <span className="text-xs text-zinc-200">{result.base_image.camera.perspective} ({result.base_image.camera.angle})</span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 border-b border-zinc-800 pb-2">Atmosphere</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase">Mood</span>
                          <span className="text-xs text-zinc-200">{result.parameter_layers?.mood?.atmosphere || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase">Lighting</span>
                          <span className="text-xs text-zinc-200">{result.parameter_layers?.lighting?.type || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] text-zinc-500 uppercase">Environment</span>
                          <span className="text-xs text-zinc-200">{result.parameter_layers?.context?.environment || 'N/A'}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  <section className="space-y-6">
                    <h3 className="text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500 border-b border-zinc-800 pb-2">Material Overrides</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {result.parameter_layers?.materials?.map((mat, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 uppercase mb-1">{mat.target_element}</span>
                            <span className="text-xs text-zinc-200 font-medium">{mat.new_material}</span>
                          </div>
                          <div className="flex gap-4 text-right">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-500 uppercase mb-1">Finish</span>
                              <span className="text-xs text-zinc-400">{mat.finish}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-zinc-500 uppercase mb-1">Color</span>
                              <span className="text-xs text-zinc-400">{mat.color}</span>
                            </div>
                          </div>
                        </div>
                      )) || <p className="text-xs text-zinc-600 italic">No material overrides detected.</p>}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
}
