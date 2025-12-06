import React, { useState } from 'react';
import Scene from './components/Scene';
import { TreeState } from './types';
import { COLORS } from './constants';

// UI Components for "Trump Luxury" Style
const LuxuryButton: React.FC<{ onClick: () => void; active: boolean; children: React.ReactNode }> = ({ onClick, active, children }) => (
  <button
    onClick={onClick}
    className={`
      px-8 py-3 
      border-2 border-[${COLORS.GOLD}] 
      uppercase tracking-widest font-bold text-sm
      transition-all duration-500 ease-out
      font-luxury-serif
      ${active 
        ? `bg-[${COLORS.GOLD}] text-[${COLORS.DEEP_GREEN}] shadow-[0_0_20px_rgba(255,215,0,0.6)]` 
        : `bg-transparent text-[${COLORS.GOLD}] hover:bg-[${COLORS.GOLD}] hover:text-[${COLORS.DEEP_GREEN}] hover:shadow-[0_0_15px_rgba(255,215,0,0.3)]`
      }
    `}
  >
    {children}
  </button>
);

const App: React.FC = () => {
  const [treeState, setTreeState] = useState<TreeState>(TreeState.CHAOS);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-black via-[#001a0f] to-[#002b19]">
      
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Scene treeState={treeState} />
      </div>

      {/* UI Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-8 md:p-12">
        
        {/* Header */}
        <header className="text-center pointer-events-auto transition-opacity duration-1000">
          <h1 className="text-4xl md:text-6xl text-[#FFD700] font-luxury-header mb-2 drop-shadow-[0_2px_10px_rgba(255,215,0,0.5)]">
            SOPHIE BB
          </h1>
          <p className="text-[#F7E7CE] uppercase tracking-[0.3em] text-xs md:text-sm font-luxury-serif opacity-80">
            The Most Tremendous Christmas Tree
          </p>
        </header>

        {/* Interaction Hints */}
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2 hidden md:flex flex-col gap-4 opacity-50 text-[#F7E7CE] text-xs uppercase tracking-widest writing-vertical-rl pointer-events-none">
           <span>Swipe to Spin</span>
           <div className="h-12 w-[1px] bg-[#F7E7CE] mx-auto opacity-50"></div>
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex flex-col items-center gap-6 mb-8">
          
          <div className="flex gap-4 md:gap-8 bg-black/40 backdrop-blur-md p-4 rounded-full border border-[#FFD700]/30">
            <LuxuryButton 
              active={treeState === TreeState.CHAOS} 
              onClick={() => setTreeState(TreeState.CHAOS)}
            >
              Chaos
            </LuxuryButton>
            <LuxuryButton 
              active={treeState === TreeState.FORMED} 
              onClick={() => setTreeState(TreeState.FORMED)}
            >
              Form Tree
            </LuxuryButton>
          </div>

          <div className="text-center text-[#F7E7CE]/60 text-[10px] uppercase tracking-widest font-luxury-serif max-w-md">
            Move your cursor to guide the magical dust. <br/> Swipe the tree to spin it with luxury physics.
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;