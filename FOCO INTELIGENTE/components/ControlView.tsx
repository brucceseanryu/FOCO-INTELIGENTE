import React, { useState, useEffect, useCallback } from 'react';
import { Power, Wifi, Zap, Settings, Globe, RefreshCw, Clock, Activity, Save } from 'lucide-react';

interface DeviceSettings {
    minTime: number;
    maxTime: number;
    autoOff: number;
}

export const ControlView: React.FC = () => {
  const [isOn, setIsOn] = useState(false);
  const [ipAddress, setIpAddress] = useState('');
  const [isIpValid, setIsIpValid] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  
  // Device Configuration State
  const [settings, setSettings] = useState<DeviceSettings>({ minTime: 250, maxTime: 850, autoOff: 0 });
  const [tempSettings, setTempSettings] = useState<DeviceSettings>({ minTime: 250, maxTime: 850, autoOff: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Validate IP regex
  useEffect(() => {
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const isValid = ipRegex.test(ipAddress);
    setIsIpValid(isValid);
    if(isValid && connectionStatus === 'idle') {
        // Auto connect attempt when valid IP is typed
        // setConnectionStatus('connecting'); // Optional: auto connect logic
    }
  }, [ipAddress, connectionStatus]);

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(
        settings.minTime !== tempSettings.minTime ||
        settings.maxTime !== tempSettings.maxTime ||
        settings.autoOff !== tempSettings.autoOff
    );
  }, [settings, tempSettings]);

  // --- API INTERACTION ---

  const fetchStatus = useCallback(async () => {
    if (!isIpValid) return;
    setConnectionStatus('connecting');
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`http://${ipAddress}/status`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            // Expected JSON: { state: boolean, min: number, max: number, timer: number }
            setIsOn(data.state);
            setSettings({ minTime: data.min, maxTime: data.max, autoOff: data.timer });
            setTempSettings({ minTime: data.min, maxTime: data.max, autoOff: data.timer });
            setConnectionStatus('connected');
            setLastSync(new Date());
        } else {
            throw new Error("Bad response");
        }
    } catch (error) {
        console.warn("Connection failed:", error);
        setConnectionStatus('error');
    }
  }, [ipAddress, isIpValid]);

  const toggleLight = async () => {
    // Optimistic UI
    const nextState = !isOn;
    setIsOn(nextState);

    if (isIpValid && connectionStatus === 'connected') {
        try {
             await fetch(`http://${ipAddress}/${nextState ? 'on' : 'off'}`, { method: 'GET' });
             // Refresh status to confirm
             setTimeout(fetchStatus, 500); 
        } catch (error) {
            console.error("Toggle failed", error);
            setConnectionStatus('error');
        }
    }
  };

  const saveSettings = async () => {
      if (!isIpValid) return;
      try {
          // Construct Query Params: ?min=X&max=Y&timer=Z
          const query = new URLSearchParams({
              min: tempSettings.minTime.toString(),
              max: tempSettings.maxTime.toString(),
              timer: tempSettings.autoOff.toString()
          }).toString();

          await fetch(`http://${ipAddress}/config?${query}`, { method: 'GET' });
          
          // Update local "saved" state
          setSettings(tempSettings);
          setHasUnsavedChanges(false);
          alert("Configuración guardada en ESP32 exitosamente.");
      } catch (e) {
          alert("Error guardando configuración. Verifica conexión WiFi.");
      }
  };

  // --- HANDLERS ---
  const handleConnect = () => {
      fetchStatus();
      setShowConfig(false);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in overflow-y-auto bg-slate-950">
      
      {/* Top Bar: Connection */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 shadow-md">
         <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Globe size={18} className="text-slate-400" />
                <input 
                    type="text" 
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="IP del ESP32 (ej: 192.168.1.45)"
                    className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none w-full sm:w-64 placeholder:text-slate-600"
                />
                <button 
                    onClick={handleConnect}
                    disabled={!isIpValid}
                    className="bg-blue-600 disabled:bg-slate-800 disabled:text-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-500 transition-colors"
                >
                    {connectionStatus === 'connecting' ? '...' : 'Conectar'}
                </button>
            </div>

            <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full border ${
                    connectionStatus === 'connected' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                    connectionStatus === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                    'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                    {connectionStatus === 'connected' ? <Wifi size={14} /> : <Activity size={14} />}
                    {connectionStatus === 'connected' ? 'Online' : connectionStatus === 'error' ? 'Sin Conexión' : 'Desconectado'}
                </div>
                {connectionStatus === 'connected' && (
                    <button onClick={fetchStatus} className="text-slate-400 hover:text-white transition-colors" title="Refrescar Datos">
                        <RefreshCw size={18} />
                    </button>
                )}
            </div>
         </div>
      </div>

      <div className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Col: Main Control */}
        <div className="flex flex-col items-center justify-center space-y-8 bg-slate-900/50 rounded-2xl p-8 border border-slate-800">
            <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Power size={24} className="text-slate-400"/> Control Manual
            </h2>

            <div className="relative group">
                <div className={`absolute -inset-4 rounded-full blur-xl opacity-40 transition duration-1000 ${isOn ? 'bg-yellow-400' : 'bg-transparent'}`}></div>
                <button
                onClick={toggleLight}
                className={`
                    relative flex items-center justify-center w-56 h-56 rounded-full border-8 shadow-2xl transition-all duration-300
                    ${isOn 
                    ? 'bg-yellow-500/10 border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)]' 
                    : 'bg-slate-800 border-slate-700 shadow-lg'
                    }
                    hover:scale-105 active:scale-95 cursor-pointer
                `}
                >
                <Power size={70} className={`transition-colors duration-300 ${isOn ? 'text-yellow-400' : 'text-slate-600'}`} />
                </button>
            </div>
            
            <div className="text-center">
                 <div className={`text-2xl font-bold transition-colors ${isOn ? 'text-yellow-200' : 'text-slate-500'}`}>
                    {isOn ? "ENCENDIDO" : "APAGADO"}
                </div>
                 <p className="text-xs text-slate-500 mt-2">
                    {lastSync ? `Última sinc: ${lastSync.toLocaleTimeString()}` : "Esperando sincronización..."}
                 </p>
            </div>
        </div>

        {/* Right Col: Settings Dashboard */}
        <div className="flex flex-col gap-6">
            
            {/* Rhythm Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Activity size={100} />
                </div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Settings size={20} className="text-blue-400" />
                        Calibración de Ritmo
                    </h3>
                    <div className="bg-blue-500/10 text-blue-300 text-[10px] px-2 py-1 rounded border border-blue-500/20">
                        AVANZADO
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                            <span>Mínimo entre aplausos</span>
                            <span className="font-mono text-blue-300">{tempSettings.minTime} ms</span>
                        </div>
                        <input 
                            type="range" 
                            min="100" max="1000" step="50"
                            value={tempSettings.minTime}
                            onChange={(e) => setTempSettings({...tempSettings, minTime: Number(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Si es muy bajo, ruidos rápidos activarán el foco.</p>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                            <span>Máximo entre aplausos</span>
                            <span className="font-mono text-blue-300">{tempSettings.maxTime} ms</span>
                        </div>
                        <input 
                            type="range" 
                            min="300" max="2000" step="50"
                            value={tempSettings.maxTime}
                            onChange={(e) => setTempSettings({...tempSettings, maxTime: Number(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <p className="text-xs text-slate-500 mt-1">Tiempo límite para dar el segundo aplauso.</p>
                    </div>
                </div>
            </div>

            {/* Timer Card */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Clock size={20} className="text-yellow-400" />
                    Auto-Apagado
                </h3>
                
                <div className="flex items-center gap-4">
                     <div className="flex-1">
                        <div className="flex justify-between text-sm text-slate-300 mb-2">
                            <span>Temporizador (minutos)</span>
                            <span className="font-mono text-yellow-300">{tempSettings.autoOff === 0 ? "Desactivado" : `${tempSettings.autoOff} min`}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" max="60" step="5"
                            value={tempSettings.autoOff}
                            onChange={(e) => setTempSettings({...tempSettings, autoOff: Number(e.target.value)})}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                        />
                     </div>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                    El foco se apagará automáticamente después de este tiempo si fue encendido manualmente o por aplauso.
                </p>
            </div>

            {/* Save Actions */}
            <div className={`flex justify-end transition-opacity duration-300 ${hasUnsavedChanges ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <button 
                    onClick={saveSettings}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105"
                >
                    <Save size={20} />
                    Guardar Cambios en ESP32
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};
