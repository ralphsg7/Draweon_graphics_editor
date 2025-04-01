import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { DrawingBoard } from './components/DrawingBoard';
import { MermaidEditor } from './components/MermaidEditor';
import { Palette, Eraser, Square, Circle, Triangle, ArrowRight, Link as Line, Hexagon, Pentagon } from 'lucide-react';

const tools = [
  { id: 'brush', icon: Palette, label: 'Brush' },
  { id: 'eraser', icon: Eraser, label: 'Eraser' },
  { id: 'square', icon: Square, label: 'Square' },
  { id: 'circle', icon: Circle, label: 'Circle' },
  { id: 'triangle', icon: Triangle, label: 'Triangle' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow' },
  { id: 'line', icon: Line, label: 'Line' },
  { id: 'hexagon', icon: Hexagon, label: 'Hexagon' },
  { id: 'pentagon', icon: Pentagon, label: 'Pentagon' },
];

function App() {
  const [currentTool, setCurrentTool] = useState('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [fillShape, setFillShape] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Draweon Grpahics editor</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs.Root defaultValue="drawing" className="space-y-4">
          <Tabs.List className="flex space-x-4 border-b border-gray-200">
            <Tabs.Trigger
              value="drawing"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 focus:border-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              Drawing Board
            </Tabs.Trigger>
            <Tabs.Trigger
              value="mermaid"
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 focus:border-gray-700 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:border-blue-600"
            >
              Mermaid Editor
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="drawing" className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-2 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Tools</label>
                    <div className="grid grid-cols-3 gap-2">
                      {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                          <button
                            key={tool.id}
                            onClick={() => setCurrentTool(tool.id)}
                            className={`p-2 rounded-lg flex flex-col items-center justify-center text-xs ${
                              currentTool === tool.id
                                ? 'bg-blue-100 text-blue-600'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                            title={tool.label}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="mt-1">{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Color</label>
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(e) => setCurrentColor(e.target.value)}
                      className="w-full h-10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Brush Size</label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={fillShape}
                        onChange={(e) => setFillShape(e.target.checked)}
                        className="rounded text-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">Fill Shape</span>
                    </label>
                  </div>
                </div>

                <div className="md:col-span-10">
                  <DrawingBoard
                    tool={currentTool}
                    color={currentColor}
                    size={brushSize}
                    fillShape={fillShape}
                  />
                </div>
              </div>
            </div>
          </Tabs.Content>

          <Tabs.Content value="mermaid" className="space-y-4">
            <MermaidEditor onDiagramGenerated={(svg) => {
              // Handle the generated SVG
              console.log('Diagram generated:', svg);
            }} />
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  );
}

export default App;
