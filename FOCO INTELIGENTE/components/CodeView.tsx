import React, { useState } from 'react';
import { Copy, Check, FileCode, Wifi, CloudLightning, Globe, Sliders } from 'lucide-react';

const ARDUINO_CODE = `/*
 * PROYECTO: CLAP SWITCH IOT - ADVANCED DASHBOARD
 * AUTOR: ClapSwitch AI Hub
 * 
 * CARACTERÍSTICAS:
 * - Detección de Doble Aplauso con Ritmo Configurable.
 * - Temporizador de Apagado Automático.
 * - API REST Local para Panel de Control Web.
 * - Integración opcional con Sinric Pro (Google Home).
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include "SinricPro.h"
#include "SinricProSwitch.h"

// --- CREDENCIALES ---
#define WIFI_SSID         "TU_WIFI_NOMBRE"
#define WIFI_PASS         "TU_WIFI_CLAVE"
#define APP_KEY           "TU_SINRIC_APP_KEY"    // Opcional
#define APP_SECRET        "TU_SINRIC_APP_SECRET" // Opcional
#define SWITCH_ID         "TU_DEVICE_ID"         // Opcional

// --- PINES ---
#define SENSOR_PIN  34
#define RELAY_PIN   26
#define LED_BUILTIN 2

// --- CONFIGURACIÓN (Valores por defecto) ---
int clapMinTime = 250;  // Tiempo mínimo entre aplausos (ms)
int clapMaxTime = 850;  // Tiempo máximo entre aplausos (ms)
int autoOffMinutes = 0; // 0 = Desactivado

// --- VARIABLES INTERNAS ---
unsigned long lastSoundTime = 0;
unsigned long relayOnTime = 0;
int clapStage = 0;
bool globalState = false;

WebServer server(80);

// --- CONTROL DE POTENCIA ---
void setPowerState(bool turnOn) {
  globalState = turnOn;
  digitalWrite(RELAY_PIN, turnOn ? HIGH : LOW);
  digitalWrite(LED_BUILTIN, turnOn ? HIGH : LOW);
  
  if (turnOn) {
    relayOnTime = millis(); // Reiniciar contador para auto-off
  }

  // Sincronizar Sinric Pro (si se usa)
  SinricProSwitch &mySwitch = SinricPro[SWITCH_ID];
  mySwitch.sendPowerStateEvent(globalState);
}

// --- API REST (ENDPOINTS) ---

// 1. GET /status -> Devuelve estado y configuración actual en JSON
void handleStatus() {
  String json = "{";
  json += "\\"state\\":" + String(globalState ? "true" : "false") + ",";
  json += "\\"min\\":" + String(clapMinTime) + ",";
  json += "\\"max\\":" + String(clapMaxTime) + ",";
  json += "\\"timer\\":" + String(autoOffMinutes);
  json += "}";
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// 2. GET /config?min=X&max=Y&timer=Z -> Actualiza parámetros
void handleConfig() {
  if (server.hasArg("min")) clapMinTime = server.arg("min").toInt();
  if (server.hasArg("max")) clapMaxTime = server.arg("max").toInt();
  if (server.hasArg("timer")) autoOffMinutes = server.arg("timer").toInt();
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "text/plain", "OK_UPDATED");
  Serial.println("Configuración actualizada desde Web");
}

// Control Básico
void handleOn() { setPowerState(true); server.sendHeader("Access-Control-Allow-Origin", "*"); server.send(200, "text/plain", "ON"); }
void handleOff() { setPowerState(false); server.sendHeader("Access-Control-Allow-Origin", "*"); server.send(200, "text/plain", "OFF"); }
void handleToggle() { setPowerState(!globalState); server.sendHeader("Access-Control-Allow-Origin", "*"); server.send(200, "text/plain", globalState ? "ON" : "OFF"); }

// --- CALLBACK SINRIC ---
bool onPowerState(const String &deviceId, bool &state) {
  setPowerState(state);
  return true;
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SENSOR_PIN, INPUT);
  
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nIP ASIGNADA: " + WiFi.localIP().toString());

  // Rutas Web
  server.on("/status", handleStatus);
  server.on("/config", handleConfig);
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.on("/toggle", handleToggle);
  server.begin();

  // Sinric Pro
  SinricProSwitch &mySwitch = SinricPro[SWITCH_ID];
  mySwitch.onPowerState(onPowerState);
  SinricPro.begin(APP_KEY, APP_SECRET);
}

void loop() {
  SinricPro.handle();
  server.handleClient();

  // 1. AUTO-OFF TIMER
  if (globalState && autoOffMinutes > 0) {
    if (millis() - relayOnTime > (autoOffMinutes * 60000UL)) {
      Serial.println("Apagado automático activado");
      setPowerState(false);
    }
  }

  // 2. DETECTOR DE APLAUSOS (Lógica de Ritmo)
  if (digitalRead(SENSOR_PIN) == HIGH) {
    unsigned long now = millis();
    if (now - lastSoundTime > 100) { // Debounce de 100ms
      
      if (clapStage == 0) {
        // Primer aplauso
        clapStage = 1; 
      } else if (clapStage == 1) {
        // Segundo aplauso (posible)
        unsigned long interval = now - lastSoundTime;
        
        // Verificar si está dentro del ritmo configurado
        if (interval >= clapMinTime && interval <= clapMaxTime) {
          Serial.println("¡Doble Aplauso Válido!");
          setPowerState(!globalState);
          clapStage = 0; // Reset
        } else {
          Serial.println("Ritmo inválido");
          clapStage = 0; // Falló el ritmo, reiniciar
        }
      }
      lastSoundTime = now;
    }
  }

  // Timeout para el segundo aplauso
  if (clapStage == 1 && (millis() - lastSoundTime > clapMaxTime + 200)) {
    clapStage = 0; // Se tardó mucho
  }
}
`;

export const CodeView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ARDUINO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileCode className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Firmware V2: API & Config</h2>
            <p className="text-sm text-slate-400">Incluye API JSON para la Dashboard</p>
          </div>
        </div>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg transition-colors border border-slate-600 text-sm font-medium"
        >
          {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
          <span>{copied ? "Código Copiado" : "Copiar Código"}</span>
        </button>
      </div>

      <div className="flex-1 relative bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700 shadow-xl flex flex-col">
        <div className="h-8 bg-[#2d2d2d] flex items-center px-4 space-x-2 border-b border-[#1e1e1e] flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span className="ml-4 text-xs text-slate-500 font-mono">firmware.ino</span>
        </div>
        <pre className="flex-1 p-6 text-sm font-mono text-gray-300 overflow-auto">
          <code>{ARDUINO_CODE}</code>
        </pre>
      </div>

      <div className="mt-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex gap-4 items-start">
        <Sliders className="text-blue-400 mt-1 flex-shrink-0" size={20} />
        <div>
           <h4 className="text-sm font-bold text-slate-200">Nuevos Endpoints Disponibles</h4>
           <ul className="text-xs text-slate-400 mt-1 space-y-1 font-mono">
             <li>GET /status &nbsp;&nbsp;&nbsp;→ JSON con estado, timers y configuración.</li>
             <li>GET /config &nbsp;&nbsp;&nbsp;→ ?min=200&max=800&timer=10 (Ajusta params).</li>
             <li>GET /toggle &nbsp;&nbsp;&nbsp;→ Alternar encendido/apagado.</li>
           </ul>
        </div>
      </div>
    </div>
  );
};
