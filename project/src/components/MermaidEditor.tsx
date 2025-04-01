import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Wand2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

interface MermaidEditorProps {
  onDiagramGenerated: (svg: string) => void;
}

export const MermaidEditor: React.FC<MermaidEditorProps> = ({ onDiagramGenerated }) => {
  const [code, setCode] = useState(`graph TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    C --> D[Rethink]
    D --> B
    B -- No --> E[End]`);
  const [error, setError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const renderDiagram = async () => {
    try {
      setError(null);
      const { svg } = await mermaid.render('preview', code);
      onDiagramGenerated(svg);
      
      if (previewRef.current) {
        previewRef.current.innerHTML = svg;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render diagram');
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      renderDiagram();
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  const generateDiagram = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an assistant that generates Mermaid.js diagrams based on user descriptions.' },
            { role: 'user', content: `Generate a Mermaid.js diagram for: ${aiPrompt}` }
          ],
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      const generatedCode = data.choices?.[0]?.message?.content?.trim() || '';
      
      if (generatedCode) {
        setCode(generatedCode);
      } else {
        setError('Failed to generate diagram');
      }

      setAiPrompt('');
    } catch (error) {
      setError('Failed to generate diagram');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Mermaid Diagram Code
          </label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-2 border border-gray-300 rounded-lg font-mono text-sm"
            placeholder="Enter your Mermaid.js code here..."
          />
        </div>

        <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              AI Assistant
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-lg">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Generate Diagram with AI
              </Dialog.Title>
              <div className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe the diagram you want to create..."
                  className="w-full h-32 p-2 border border-gray-300 rounded-lg"
                />
                <div className="flex justify-end space-x-2">
                  <Dialog.Close asChild>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    onClick={generateDiagram}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
        <div ref={previewRef} className="w-full overflow-auto" />
      </div>
    </div>
  );
};

