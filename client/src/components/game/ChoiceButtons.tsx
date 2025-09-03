import React from 'react';
import { Button } from '../ui/button';
import { StoryChoice } from '../../types/game';
import { ChevronRight, Loader2 } from 'lucide-react';

interface ChoiceButtonsProps {
  choices: StoryChoice[];
  onChoice: (choiceIndex: number) => void;
  disabled?: boolean;
}

export const ChoiceButtons: React.FC<ChoiceButtonsProps> = ({
  choices,
  onChoice,
  disabled = false
}) => {
  if (choices.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 text-sm">
          {disabled ? 'Processing...' : 'No choices available at this time.'}
        </p>
      </div>
    );
  }

  const getChoiceIcon = (choice: StoryChoice) => {
    const text = choice.text.toLowerCase();
    
    if (text.includes('attack') || text.includes('fight') || text.includes('combat')) {
      return '⚔️';
    } else if (text.includes('talk') || text.includes('speak') || text.includes('ask')) {
      return '💬';
    } else if (text.includes('explore') || text.includes('search') || text.includes('investigate')) {
      return '🔍';
    } else if (text.includes('help') || text.includes('heal') || text.includes('assist')) {
      return '❤️';
    } else if (text.includes('magic') || text.includes('spell') || text.includes('cast')) {
      return '✨';
    } else if (text.includes('run') || text.includes('flee') || text.includes('escape')) {
      return '🏃';
    }
    
    return null;
  };

  const getChoiceVariant = (choice: StoryChoice) => {
    const text = choice.text.toLowerCase();
    
    if (text.includes('attack') || text.includes('fight')) {
      return 'destructive';
    } else if (text.includes('help') || text.includes('heal')) {
      return 'default';
    } else if (text.includes('run') || text.includes('flee')) {
      return 'secondary';
    }
    
    return 'outline';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-blue-400 mb-4">Choose your action:</h3>
      
      <div className="grid gap-2">
        {choices.map((choice, index) => {
          const icon = getChoiceIcon(choice);
          const variant = getChoiceVariant(choice) as any;
          
          return (
            <Button
              key={index}
              variant={variant}
              size="lg"
              onClick={() => onChoice(index)}
              disabled={disabled}
              className="w-full justify-between text-left h-auto p-4 bg-gray-800 border-gray-600 hover:bg-gray-700 hover:border-gray-500 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                {icon && <span className="text-lg">{icon}</span>}
                <span className="text-sm leading-relaxed">{choice.text}</span>
              </div>
              
              {disabled ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </Button>
          );
        })}
      </div>

      {disabled && (
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Please wait while your choice is processed...
          </p>
        </div>
      )}
    </div>
  );
};
