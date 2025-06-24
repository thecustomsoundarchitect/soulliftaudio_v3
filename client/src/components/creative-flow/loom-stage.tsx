import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreativeFlowSession } from "@shared/schema";
import { useLocation } from "wouter";

interface LoomStageProps {
  session: CreativeFlowSession;
  onBack: () => void;
  onStartOver: () => void;
  onAIWeave: () => void;
  onAIStitch: (currentMessage: string) => void;
  onUpdateMessage: (message: string) => void;
  onContinueToAudio: () => void;
  isLoading: boolean;
}

export default function LoomStage({
  session,
  onBack,
  onStartOver,
  onAIWeave,
  onAIStitch,
  onUpdateMessage,
  onContinueToAudio,
  isLoading
}: LoomStageProps) {
  const [message, setMessage] = useState(session.finalMessage || "");
  const [wordCount, setWordCount] = useState(0);
  const [readTime, setReadTime] = useState(0);
  const [location, setLocation] = useLocation();

  // Sync local message state with session finalMessage
  useEffect(() => {
    if (session.finalMessage !== message) {
      setMessage(session.finalMessage || "");
    }
  }, [session.finalMessage]);

  useEffect(() => {
    const words = message.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setReadTime(Math.max(1, Math.ceil(words.length / 200)));
  }, [message]);

  const handleMessageChange = (newMessage: string) => {
    setMessage(newMessage);
    onUpdateMessage(newMessage);
  };

  const copyMessage = () => {
    if (message.trim()) {
      navigator.clipboard.writeText(message);
      alert('Message copied to clipboard!');
    }
  };

  const exportMessage = () => {
    if (message.trim()) {
      const blob = new Blob([message], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soul-hug-${session.recipientName.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const clearMessage = () => {
    if (confirm('Are you sure you want to clear the message?')) {
      setMessage('');
      onUpdateMessage('');
    }
  };

  const sendAsMessage = () => {
    if (message.trim()) {
      alert('Soul Hug sent as message!');
      onStartOver();
    } else {
      alert('Please create a message first.');
    }
  };

  const continueToAudio = () => {
    console.log('Continue to Audio Hug button clicked');
    if (message.trim()) {
      // Ensure the message is saved before continuing
      onUpdateMessage(message);
      console.log('Moving to audio stage');
      onContinueToAudio();
    } else {
      alert('Please create a message before continuing to audio.');
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto glass-morphism rounded-2xl shadow-2xl p-6 sm:p-8 fade-in">
      <div className="text-center mb-8">
        <div className="mb-6">
          <i className="fas fa-pen-fancy text-4xl text-teal-500 mb-4"></i>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-teal-600 to-indigo-600 bg-clip-text text-transparent">
            CRAFT YOUR SOUL HUG
          </h1>
        </div>
        <p className="text-slate-600 mt-2 text-lg max-w-2xl mx-auto leading-relaxed">
          Craft your message with heart. You are the director of this process.
        </p>
      </div>

      <div className="glass-secondary p-6 rounded-lg border border-white/50 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Descriptors & Ingredients */}
          <div className="space-y-4">
            {/* Selected Descriptors */}
            {session.descriptors && session.descriptors.length > 0 && (
              <div className="bg-white/90 p-4 rounded-lg border border-slate-200 shadow-sm h-fit">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-slate-800 flex items-center">
                    <i className="fas fa-tags text-indigo-500 mr-2"></i>
                    Selected Descriptors
                  </h4>
                  <button
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium cursor-grab hover:cursor-grabbing"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', session.descriptors?.join(', ') || '');
                    }}
                  >
                    <i className="fas fa-hand-rock mr-1"></i>Drag All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {session.descriptors.map((descriptor, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full text-sm font-medium border border-indigo-200 cursor-grab hover:cursor-grabbing hover:shadow-md hover:scale-105 transition-all"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', descriptor);
                      }}
                      title="Drag this descriptor to your message"
                    >
                      {descriptor}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredients */}
            <div className="bg-white/90 p-4 rounded-lg border border-slate-200 shadow-sm flex-1">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center">
                <i className="fas fa-puzzle-piece text-teal-500 mr-2"></i>
                Your Ingredients
              </h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {session.ingredients?.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    className="bg-slate-50 p-3 rounded-lg border border-slate-200 cursor-grab hover:shadow-md hover:border-slate-300 transition-all transform hover:scale-[1.02]"
                    draggable="true"
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', ingredient.content);
                    }}
                  >
                    <p className="text-xs text-slate-500 mb-1 italic font-medium">{ingredient.prompt}</p>
                    <p className="text-sm text-slate-800 leading-relaxed">{ingredient.content}</p>
                  </div>
                )) || (
                  <p className="text-slate-500 italic text-sm">No ingredients added yet. Go back to gather some!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Message Editor */}
          <div className="space-y-4">
            <div className="bg-white/90 p-6 rounded-lg border border-slate-200 shadow-sm h-full min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center">
                  <i className="fas fa-pen text-teal-500 mr-2"></i>
                  Your Soul Hug Message
                </h3>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span className="bg-slate-100 px-2 py-1 rounded">{wordCount} words</span>
                  <span className="bg-slate-100 px-2 py-1 rounded">{readTime} min read</span>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col">
                <Textarea
                  value={message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  placeholder="Begin crafting your Soul Hug here... You can drag ingredients from the left, or start typing your heart's message."
                  className="flex-1 min-h-[350px] resize-none border-slate-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg p-4 text-slate-800 leading-relaxed text-base font-serif"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const content = e.dataTransfer.getData('text/plain');
                    const textarea = e.target as HTMLTextAreaElement;
                    const cursorPosition = textarea.selectionStart;
                    const newMessage = message.slice(0, cursorPosition) + '\n\n' + content + '\n\n' + message.slice(cursorPosition);
                    handleMessageChange(newMessage);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Weave Message button clicked');
                        onAIWeave();
                      }}
                      disabled={isLoading || !session.ingredients || session.ingredients.length === 0}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium px-3 py-2 rounded-lg shadow hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Weaving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-magic mr-2"></i>Weave Message
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Polish & Refine button clicked with message:', message);
                        onAIStitch(message);
                      }}
                      disabled={isLoading || !message.trim()}
                      variant="outline"
                      size="sm"
                      className="border-indigo-400 text-indigo-600 hover:bg-indigo-50 font-medium px-3 py-2 rounded-lg shadow transition-all disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>Polishing...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-edit mr-2"></i>Polish & Refine
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Clear button clicked');
                        clearMessage();
                      }}
                      variant="outline"
                      size="sm"
                      className="text-slate-600 border-slate-300 hover:bg-slate-50 font-medium px-3 py-2 rounded-lg transition-all"
                    >
                      <i className="fas fa-times mr-1"></i>Clear
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Export button clicked');
                        exportMessage();
                      }}
                      disabled={!message.trim()}
                      className="text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50 text-sm transition-colors"
                    >
                      <i className="fas fa-download mr-1"></i>Export
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Copy button clicked');
                        copyMessage();
                      }}
                      disabled={!message.trim()}
                      className="text-teal-600 hover:text-teal-800 font-medium disabled:opacity-50 text-sm transition-colors"
                    >
                      <i className="fas fa-copy mr-1"></i>Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Back button clicked');
            onBack();
          }}
          variant="secondary"
          className="bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-700 transition-all"
        >
          <i className="fas fa-arrow-left mr-2"></i>Back
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Start Over button clicked');
            onStartOver();
          }}
          variant="outline"
          className="border-slate-600 text-slate-600 hover:bg-slate-50 font-bold py-3 px-6 rounded-lg shadow-lg transition-all"
        >
          <i className="fas fa-refresh mr-2"></i>Start Over
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Send as Message button clicked');
            sendAsMessage();
          }}
          disabled={!message.trim()}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
        >
          <i className="fas fa-paper-plane mr-2"></i>Send as Message
        </Button>
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Continue to Audio Hug button clicked');
            continueToAudio();
          }}
          disabled={!message.trim()}
          className="bg-gradient-to-r from-teal-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-teal-700 hover:to-indigo-700 transition-transform transform hover:scale-105 disabled:opacity-50"
        >
          <i className="fas fa-microphone mr-2"></i>Continue to Audio Hug
        </Button>
      </div>
    </div>
  );
}