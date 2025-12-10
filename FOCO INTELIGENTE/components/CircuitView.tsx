import React from 'react';
import { AlertTriangle, Info, Cpu, Zap, Box, Scissors } from 'lucide-react';
import { ComponentItem } from '../types';

export const CircuitView: React.FC = () => {
  const components: ComponentItem[] = [
    { name: "ESP32 (DevKit o Mini)", description: "Controlador IoT. Usa versión Mini si el espacio es muy reducido.", pins: "GPIO 32, 34, VIN", voltage: "5V DC" },
    { name: "Cargador Celular 5V", description: "FUENTE: Desarma la carcasa plástica. Será tu conversor 220V a 5V.", pins: "Entrada AC / Salida USB", voltage: "Input 220V / Output 5V" },
    { name: "Sensor KY-037", description: "Micrófono. Ajustar tornillo azul (sensibilidad).", pins: "DO (Digital Out)", voltage: "3.3V - 5V" },
    { name: "Relay 1CH 5V", description: "Interruptor. Aísla la parte lógica de la potencia.", pins: "IN, VCC, GND", voltage: "5V DC" }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in pb-24">
      
      {/* Warning Header */}
      <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-4 animate-pulse">
        <AlertTriangle className="text-red-500 flex-shrink-0" size={32} />
        <div>
          <h3 className="text-red-400 font-bold text-lg">PELIGRO MORTAL: 220V AC</h3>
          <p className="text-red-200/90 text-sm mt-1">
            Estás trabajando con corriente alterna de red. <strong>Tocar los cables de 220V o la placa del cargador mientras está enchufado te causará una descarga eléctrica grave.</strong>
            <br/>1. Corta la luz general antes de instalar.
            <br/>2. Aísla TODO el circuito de bajo voltaje (ESP32) con cinta aislante o termocontraíble para que no toque los 220V dentro del socket.
          </p>
        </div>
      </div>

      {/* Wiring Diagram - CSS Representation */}
      <div className="bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <Box size={300} />
        </div>
        <h2 className="text-xl font-bold text-white mb-6">Montaje Compacto en Socket</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
            {/* High Voltage Side */}
            <div className="space-y-6">
                <div className="bg-slate-800 p-5 rounded-lg border-l-4 border-yellow-500 h-full">
                    <h4 className="font-bold text-yellow-400 mb-4 flex items-center gap-2">
                        <Zap size={20}/> Conexiones 220V (Potencia)
                    </h4>
                    <div className="space-y-4 text-sm text-slate-300">
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                            <strong className="text-white block mb-1">1. Fuente de Poder (Cargador Desarmado)</strong>
                            <p>Suelda dos cables a las patas de entrada (donde iban al enchufe) del cargador y conéctalos directamente a la línea de 220V del socket (Fase y Neutro). Esto mantendrá al ESP32 siempre encendido.</p>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50">
                            <strong className="text-white block mb-1">2. Control del Foco (Relay)</strong>
                            <p>Interrumpe SOLO el cable de FASE que va al foco.</p>
                            <ul className="mt-2 space-y-1 text-slate-400 pl-4 list-disc">
                                <li>Fase Entrada (Techo) → Relay COM (Común)</li>
                                <li>Relay NO (Normal Open) → Contacto central del socket</li>
                                <li>Neutro (Techo) → Rosca del socket (Directo)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Low Voltage Side */}
            <div className="space-y-6">
                <div className="bg-slate-800 p-5 rounded-lg border-l-4 border-blue-500 h-full">
                    <h4 className="font-bold text-blue-400 mb-4 flex items-center gap-2">
                        <Cpu size={20}/> Conexiones 5V (Lógica ESP32)
                    </h4>
                    <ul className="space-y-3 text-sm text-slate-300">
                        <li className="flex items-center gap-3 p-2 bg-slate-900/30 rounded">
                            <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-yellow-400">PWR</span>
                            <div>
                                <div className="font-bold text-slate-200">Alimentación ESP32</div>
                                <span className="text-slate-400">Salida USB Cargador (+5V) → PIN VIN (ESP32)</span><br/>
                                <span className="text-slate-400">Salida USB Cargador (GND) → PIN GND (ESP32)</span>
                            </div>
                        </li>
                        <li className="flex items-center gap-3 p-2 bg-slate-900/30 rounded">
                            <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-green-400">MIC</span>
                            <div>
                                <div className="font-bold text-slate-200">Sensor KY-037</div>
                                <span className="text-slate-400">VCC → 3.3V | GND → GND</span><br/>
                                <span className="text-slate-400">DO (Salida Digital) → PIN GPIO 34</span>
                            </div>
                        </li>
                        <li className="flex items-center gap-3 p-2 bg-slate-900/30 rounded">
                            <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-blue-400">REL</span>
                            <div>
                                <div className="font-bold text-slate-200">Módulo Relay</div>
                                <span className="text-slate-400">VCC → 5V (VIN) | GND → GND</span><br/>
                                <span className="text-slate-400">IN (Señal) → PIN GPIO 26</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700">
            <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Lista de Materiales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {components.map((comp, idx) => (
                    <div key={idx} className="bg-slate-800/50 p-3 rounded border border-slate-700">
                        <div className="font-medium text-slate-200">{comp.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{comp.voltage}</div>
                        <div className="text-xs text-blue-400 mt-1">{comp.pins}</div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg flex items-start gap-3">
            <Scissors className="text-blue-400 flex-shrink-0" size={24} />
            <div className="text-sm text-slate-300">
                <strong className="text-blue-300 block mb-1">El Truco del Cargador:</strong>
                Compra un cargador USB barato y pequeño (tipo cubo de iPhone o genérico). Ábrelo con cuidado, saca la placa electrónica. Suelda cables a la entrada AC (donde iban las patas metálicas) y a la salida USB (+ y -). Envuelve la placa en cinta aislante (Kapton tape es ideal por el calor) antes de meterla al socket.
            </div>
        </div>
        <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg flex items-start gap-3">
            <Info className="text-green-400 flex-shrink-0" size={24} />
            <div className="text-sm text-slate-300">
                <strong className="text-green-300 block mb-1">Calibración KY-037:</strong>
                El sensor tiene un tornillo azul (potenciómetro). Gíralo hasta que el LED "Signal" esté APAGADO en silencio, pero parpadee brevemente cuando aplaudas fuerte. Si se queda prendido siempre, bájale sensibilidad.
            </div>
        </div>
      </div>

    </div>
  );
};