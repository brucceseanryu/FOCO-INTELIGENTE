import React, { useState } from 'react';
import { ControlView } from './components/ControlView';
import { CircuitView } from './components/CircuitView';
import { CodeView } from './components/CodeView';
import { AssistantView } from './components/AssistantView';
import { AppView } from './types';
import { Smartphone, Zap, Code, Bot, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.CONTROL);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case AppView.CONTROL: return <ControlView />;
      case AppView.CIRCUIT: return <CircuitView />;
      case AppView.CODE: return <CodeView />;
      case AppView.ASSISTANT: return <AssistantView />;
      default: return <ControlView />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMenuOpen(false);
      }}
      className={`
        flex items-center space-x-3 px-4 py-3 rounded-lg w-full transition-all duration-200
        ${currentView === view 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-medium' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
        }
      `}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
            <Zap className="text-white" size={20} fill="currentColor" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">ClapSwitch AI</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem view={AppView.CONTROL} icon={Smartphone} label="Control Remoto" />
          <NavItem view={AppView.CIRCUIT} icon={Zap} label="Circuito & Hardware" />
          <NavItem view={AppView.CODE} icon={Code} label="Firmware" />
          <NavItem view={AppView.ASSISTANT} icon={Bot} label="Asistente IA" />
        </nav>

        <div className="text-xs text-slate-600 px-2 mt-auto">
          v1.0.0 • ESP32 Socket Edition
        </div>
      </aside>

      {/* Mobile Header & Overlay Menu */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="md:hidden flex items-center justify-between p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
                <Zap className="text-white" size={18} fill="currentColor" />
            </div>
            <span className="font-bold text-slate-100">ClapSwitch AI</span>
          </div>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {isMenuOpen && (
          <div className="absolute inset-0 top-16 bg-slate-950 z-30 p-4 md:hidden animate-fade-in">
            <nav className="space-y-2">
                <NavItem view={AppView.CONTROL} icon={Smartphone} label="Control Remoto" />
                <NavItem view={AppView.CIRCUIT} icon={Zap} label="Circuito & Hardware" />
                <NavItem view={AppView.CODE} icon={Code} label="Firmware" />
                <NavItem view={AppView.ASSISTANT} icon={Bot} label="Asistente IA" />
            </nav>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;