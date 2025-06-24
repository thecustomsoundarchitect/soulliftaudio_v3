import { useState } from "react";
import { useCreativeFlow } from "@/hooks/use-creative-flow";
import StageNavigation from "@/components/creative-flow/stage-navigation";
import AnchorStage from "@/components/creative-flow/anchor-stage";
import PaletteStage from "@/components/creative-flow/palette-stage";
import LoomStage from "@/components/creative-flow/loom-stage";
import IngredientModal from "@/components/creative-flow/ingredient-modal";
import AudioHug from "@/pages/audio-hug";

export default function CreativeFlow() {
  const {
    state,
    currentStage,
    setCurrentStage,
    updateSession,
    addIngredient,
    removeIngredient,
    generatePrompts,
    aiWeave,
    aiStitch,
    isLoading
  } = useCreativeFlow();

  const [modalOpen, setModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const openModal = (promptText: string) => {
    setCurrentPrompt(promptText);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentPrompt("");
  };

  const handleAddIngredient = async (content: string) => {
    if (!content.trim()) return;
    
    await addIngredient({
      prompt: currentPrompt,
      content: content.trim()
    });
    closeModal();
  };

  const handleAddDraggedIngredient = async (ingredient: { prompt: string; content: string }) => {
    await addIngredient(ingredient);
  };

  const handleAnchorSubmit = async (data: {
    recipientName: string;
    anchor: string;
    occasion?: string;
    tone?: string;
  }) => {
    try {
      await updateSession(data);
      await generatePrompts(data.recipientName, data.anchor, data.occasion, data.tone);
      setCurrentStage('reflection');
    } catch (error) {
      console.error('Error setting anchor:', error);
    }
  };

  const handleAIWeave = async () => {
    if (!state.session) {
      console.error('No session available for AI Weave');
      return;
    }
    
    if (!state.session.ingredients || state.session.ingredients.length === 0) {
      alert('Please add some ingredients before weaving a message.');
      return;
    }

    try {
      console.log('Starting AI Weave with:', {
        recipientName: state.session.recipientName,
        anchor: state.session.anchor,
        ingredients: state.session.ingredients
      });

      const message = await aiWeave({
        recipientName: state.session.recipientName,
        anchor: state.session.anchor,
        ingredients: (state.session.ingredients || []).map(ing => ({
          prompt: ing.prompt,
          content: ing.content
        })),
        occasion: state.session.occasion ?? undefined,
        tone: state.session.tone ?? undefined
      });
      
      console.log('AI Weave result:', message);
      
      if (message) {
        await updateSession({ finalMessage: message });
      }
    } catch (error) {
      console.error('AI Weave failed:', error);
      alert('Failed to weave message. Please try again.');
    }
  };

  const handleAIStitch = async (currentMessage: string) => {
    if (!state.session) {
      console.error('No session available for AI Stitch');
      return;
    }
    
    if (!currentMessage.trim()) {
      alert('Please write a message before trying to polish it.');
      return;
    }

    try {
      console.log('Starting AI Stitch with:', {
        currentMessage,
        recipientName: state.session.recipientName,
        anchor: state.session.anchor
      });

      const improvedMessage = await aiStitch({
        currentMessage,
        recipientName: state.session.recipientName,
        anchor: state.session.anchor
      });
      
      console.log('AI Stitch result:', improvedMessage);
      
      if (improvedMessage) {
        await updateSession({ finalMessage: improvedMessage });
      }
    } catch (error) {
      console.error('AI Stitch failed:', error);
      alert('Failed to polish message. Please try again.');
    }
  };

  const startOver = () => {
    if (confirm('Are you sure you want to start over? This will clear all your progress.')) {
      window.location.reload();
    }
  };

  return (
    <div className="text-slate-800 min-h-screen p-4">
      <StageNavigation 
        currentStage={currentStage} 
        onStageClick={setCurrentStage}
      />
      
      <div className="flex items-center justify-center">
        {currentStage === 'intention' && (
          <AnchorStage 
            onSubmit={handleAnchorSubmit}
            isLoading={isLoading}
          />
        )}
        
        {currentStage === 'reflection' && state.session && (
          <PaletteStage
            session={state.session}
            onOpenModal={openModal}
            onRemoveIngredient={removeIngredient}
            onUpdateDescriptors={(descriptors) => {
              updateSession({
                descriptors
              } as any);
            }}
            onAddIngredient={handleAddDraggedIngredient}
            onBack={() => setCurrentStage('intention')}
            onContinue={() => setCurrentStage('expression')}
          />
        )}
        
        {currentStage === 'expression' && state.session && (
          <LoomStage
            session={state.session}
            onBack={() => setCurrentStage('reflection')}
            onStartOver={startOver}
            onAIWeave={handleAIWeave}
            onAIStitch={handleAIStitch}
            onUpdateMessage={(message) => updateSession({ finalMessage: message })}
            onContinueToAudio={() => setCurrentStage('audio')}
            isLoading={isLoading}
          />
        )}
        
        {currentStage === 'audio' && state.session && (
          <div className="w-full">
            <div className="mb-6">
              <button
                onClick={() => setCurrentStage('expression')}
                className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>Back to Craft
              </button>
            </div>
            <AudioHug />
          </div>
        )}
      </div>
      
      <IngredientModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSubmit={handleAddIngredient}
        promptText={currentPrompt}
      />
      
      {isLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass-morphism rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-800 font-medium">Creating your personalized prompts...</p>
          </div>
        </div>
      )}
    </div>
  );
}
