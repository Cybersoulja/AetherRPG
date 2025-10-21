/**
 * This file contains the AI agent engine for the game.
 */
import { AIAgent } from '../types/game';

export class AIAgentEngine {
  private agents: AIAgent[] = [
    {
      id: 'dungeon_master',
      name: 'Taskade DM',
      role: 'dungeon_master',
      personality: 'A wise and experienced storyteller who guides adventures with fairness and creativity.',
      knowledge: ['world_lore', 'rules', 'narrative_flow', 'character_development'],
      responseTemplates: {
        combat_start: [
          "The air crackles with tension as your enemies emerge from the shadows!",
          "Battle is upon you! Choose your actions wisely, brave adventurer.",
          "Your foes have revealed themselves - let the clash of steel and magic begin!"
        ],
        victory: [
          "Through skill and determination, you have emerged victorious!",
          "Your enemies lie defeated! Victory is yours this day.",
          "Well fought! Your tactical prowess has seen you through this challenge."
        ],
        discovery: [
          "Your keen eyes have uncovered something of interest...",
          "As you explore, you discover something that catches your attention.",
          "The shadows reveal their secrets to those brave enough to seek them."
        ],
        death: [
          "The darkness claims another soul... but perhaps this is not the end?",
          "Your journey ends here, but legends speak of heroes who return from beyond.",
          "Though you have fallen, your story may yet continue in another form."
        ]
      }
    },
    {
      id: 'merchant_npc',
      name: 'Gareth the Trader',
      role: 'npc',
      personality: 'A shrewd but honest merchant who has traveled far and wide.',
      knowledge: ['trade_routes', 'item_values', 'local_gossip', 'distant_lands'],
      responseTemplates: {
        greeting: [
          "Welcome, traveler! I have wares from across the realm.",
          "Ah, another adventurer! You look like you could use some quality equipment.",
          "Greetings! My goods are the finest you'll find in these parts."
        ],
        bargaining: [
          "That's a steep price, but I admire your bold spirit!",
          "Hmm, perhaps we can come to a mutually beneficial arrangement...",
          "You drive a hard bargain, but I respect that in a customer."
        ],
        gossip: [
          "I've heard strange tales from the road... would you like to know more?",
          "The other merchants speak of unusual happenings in distant towns.",
          "Travelers bring the most interesting stories to my ears."
        ]
      }
    },
    {
      id: 'companion_ally',
      name: 'Elena the Cleric',
      role: 'ally',
      personality: 'A devoted healer with unwavering faith and a kind heart.',
      knowledge: ['divine_magic', 'healing_arts', 'holy_lore', 'moral_guidance'],
      responseTemplates: {
        support: [
          "Fear not - the light protects us on this journey.",
          "Stay strong, my friend. Together we can overcome any darkness.",
          "May divine grace shield us from harm and guide our path."
        ],
        healing: [
          "Let the healing light mend your wounds and restore your strength.",
          "By sacred power, your injuries shall be cleansed and made whole.",
          "The divine energies flow through me to aid you in your time of need."
        ],
        encouragement: [
          "Your courage inspires hope in even the darkest of times.",
          "I have faith in your abilities - you shall overcome this trial.",
          "The righteous path is never easy, but you walk it with honor."
        ]
      }
    }
  ];

  getAgent(id: string): AIAgent | undefined {
    return this.agents.find(agent => agent.id === id);
  }

  generateResponse(agentId: string, context: string, additionalData?: any): string {
    const agent = this.getAgent(agentId);
    if (!agent) return "I'm sorry, I cannot respond right now.";

    // Simple AI response generation based on context and agent personality
    const responses = this.getResponsesForContext(agent, context);
    if (responses.length === 0) {
      return this.generateGenericResponse(agent, context);
    }

    // Add some variety by picking a random response
    const randomIndex = Math.floor(Math.random() * responses.length);
    let response = responses[randomIndex];

    // Add personalization based on agent personality and context
    response = this.personalizeResponse(agent, response, additionalData);

    return response;
  }

  private getResponsesForContext(agent: AIAgent, context: string): string[] {
    const contextMap: { [key: string]: string } = {
      'battle_start': 'combat_start',
      'combat_start': 'combat_start',
      'victory': 'victory',
      'win': 'victory',
      'defeat': 'victory',
      'found_item': 'discovery',
      'discovery': 'discovery',
      'explore': 'discovery',
      'death': 'death',
      'game_over': 'death',
      'greeting': 'greeting',
      'hello': 'greeting',
      'shop': 'bargaining',
      'trade': 'bargaining',
      'buy': 'bargaining',
      'sell': 'bargaining',
      'help': 'support',
      'heal': 'healing',
      'encourage': 'encouragement',
      'advice': 'encouragement'
    };

    const templateKey = contextMap[context.toLowerCase()] || context.toLowerCase();
    return agent.responseTemplates[templateKey] || [];
  }

  private generateGenericResponse(agent: AIAgent, context: string): string {
    const genericResponses = {
      dungeon_master: [
        "The winds of fate shift around you as new possibilities emerge.",
        "Your actions ripple through the fabric of this world's story.",
        "What happens next depends on the choices you make, brave soul."
      ],
      npc: [
        "That's an interesting matter to consider...",
        "I've seen many things in my travels, and this reminds me of something.",
        "Perhaps time will reveal the answer to your question."
      ],
      ally: [
        "I stand ready to assist you however I can.",
        "Together, we shall face whatever challenges await.",
        "Your friendship means more to me than you know."
      ]
    };

    const responses = genericResponses[agent.role] || ["I understand."];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private personalizeResponse(agent: AIAgent, response: string, additionalData?: any): string {
    // Add some personalization based on agent and context
    if (additionalData?.playerName) {
      response = response.replace(/\btraveler\b/gi, additionalData.playerName);
      response = response.replace(/\badventurer\b/gi, additionalData.playerName);
    }

    // Add personality touches
    if (agent.personality.includes('wise')) {
      response = this.addWisdomTouches(response);
    }
    if (agent.personality.includes('shrewd')) {
      response = this.addMerchantTouches(response);
    }
    if (agent.personality.includes('devoted')) {
      response = this.addDevotionTouches(response);
    }

    return response;
  }

  private addWisdomTouches(response: string): string {
    const wisdomPrefixes = [
      "In my experience, ",
      "The ancient texts tell us that ",
      "As the old saying goes, ",
      ""
    ];
    
    const prefix = wisdomPrefixes[Math.floor(Math.random() * wisdomPrefixes.length)];
    return prefix + response;
  }

  private addMerchantTouches(response: string): string {
    const merchantSuffixes = [
      " A good deal for all involved!",
      " Business is business, after all.",
      " That's the way of the market, my friend.",
      ""
    ];
    
    const suffix = merchantSuffixes[Math.floor(Math.random() * merchantSuffixes.length)];
    return response + suffix;
  }

  private addDevotionTouches(response: string): string {
    const devotionSuffixes = [
      " May the light guide us.",
      " Blessed be our path.",
      " In faith, we find strength.",
      ""
    ];
    
    const suffix = devotionSuffixes[Math.floor(Math.random() * devotionSuffixes.length)];
    return response + suffix;
  }

  simulateAIThinking(agentId: string, complexity: 'simple' | 'moderate' | 'complex' = 'moderate'): Promise<string> {
    // Simulate AI processing time
    const delays = {
      simple: 500,
      moderate: 1500,
      complex: 3000
    };

    return new Promise((resolve) => {
      setTimeout(() => {
        const agent = this.getAgent(agentId);
        resolve(agent ? `${agent.name} has finished processing your request.` : 'Processing complete.');
      }, delays[complexity]);
    });
  }

  getAllAgents(): AIAgent[] {
    return [...this.agents];
  }

  getAgentsByRole(role: AIAgent['role']): AIAgent[] {
    return this.agents.filter(agent => agent.role === role);
  }
}
