interface StoryNode {
  id: string;
  text: string;
  choices: StoryChoice[];
  tags?: string[];
}

interface StoryChoice {
  text: string;
  destination: string;
  conditions?: Record<string, any>;
}

interface StoryData {
  nodes: Record<string, StoryNode>;
  variables: Record<string, any>;
  startNode: string;
}

export class CustomStoryEngine {
  private storyData: StoryData;
  private currentNodeId: string;
  private variables: Record<string, any>;
  private saveKey = 'rpg_story_save';

  constructor() {
    this.storyData = this.createStoryData();
    this.currentNodeId = this.storyData.startNode;
    this.variables = { ...this.storyData.variables };
    this.loadProgress();
  }

  private createStoryData(): StoryData {
    return {
      startNode: 'start',
      variables: {
        playerName: '',
        hasMap: false,
        metCleric: false,
        questAccepted: false
      },
      nodes: {
        start: {
          id: 'start',
          text: `Welcome, brave adventurer, to the realm of Aethermoor!

You stand at the entrance of the ancient town of Millbrook, where rumors speak of a dark evil stirring in the nearby Shadowlands. The townspeople eye you with a mixture of hope and fear.`,
          choices: [
            { text: 'Approach the town guard for information', destination: 'guard_conversation' },
            { text: 'Visit the local tavern to gather rumors', destination: 'tavern_scene' },
            { text: 'Explore the marketplace for supplies', destination: 'marketplace' },
            { text: 'Head directly toward the Shadowlands', destination: 'direct_adventure' }
          ],
          tags: ['location:millbrook']
        },
        guard_conversation: {
          id: 'guard_conversation',
          text: `The town guard, a grizzled veteran named Captain Aldric, looks you up and down with experienced eyes.

"Another adventurer, eh? Well, we can use all the help we can get. Strange things have been happening lately - livestock going missing, eerie lights in the forest, and some folks swear they've seen shadows moving on their own."`,
          choices: [
            { text: 'Ask about the Shadowlands', destination: 'shadowlands_info' },
            { text: 'Volunteer to help with the investigation', destination: 'accept_quest' },
            { text: 'Thank him and continue exploring', destination: 'start' }
          ],
          tags: ['character:captain_aldric']
        },
        tavern_scene: {
          id: 'tavern_scene',
          text: `The Prancing Pony tavern is dimly lit and filled with the low murmur of worried conversations. The barkeeper, a stout woman named Marta, greets you warmly.

"Welcome, stranger! You look like you could use a drink and perhaps some information. We don't get many travelers through here anymore, not with all the trouble brewing."`,
          choices: [
            { text: 'Buy a drink and listen to gossip', destination: 'tavern_gossip' },
            { text: 'Ask about the recent troubles', destination: 'tavern_troubles' },
            { text: 'Leave the tavern', destination: 'start' }
          ],
          tags: ['location:tavern', 'character:marta']
        },
        marketplace: {
          id: 'marketplace',
          text: `The marketplace is smaller than you expected, with only a few vendors still brave enough to set up shop. An elderly merchant waves you over to his stall filled with various goods.

"Adventurer! Perfect timing. I have just what you need for dangerous journeys - potions, weapons, magical trinkets. Everything's reasonably priced, considering the circumstances."`,
          choices: [
            { text: 'Browse the merchant\'s wares', destination: 'merchant_shop' },
            { text: 'Ask about the dangerous journeys', destination: 'merchant_info' },
            { text: 'Politely decline and move on', destination: 'start' }
          ],
          tags: ['location:marketplace', 'character:merchant']
        },
        direct_adventure: {
          id: 'direct_adventure',
          text: `You stride confidently toward the edge of town, heading for the dark treeline that marks the beginning of the Shadowlands. The temperature seems to drop as you approach.

As you reach the forest's edge, you notice strange, twisted trees and an unnatural silence. Your adventure into the unknown begins here.`,
          choices: [
            { text: 'Enter the Shadowlands cautiously', destination: 'enter_shadowlands' },
            { text: 'Turn back and seek more information first', destination: 'start' }
          ],
          tags: ['location:shadowlands_edge']
        },
        shadowlands_info: {
          id: 'shadowlands_info',
          text: `Captain Aldric's expression grows grim. "The Shadowlands weren't always cursed. Once, it was called the Greenwood - a beautiful forest where druids lived in harmony with nature. But something changed about a month ago.

Now it's a place of perpetual twilight, where the very air feels thick with malevolent energy. We've lost three scouting parties already."`,
          choices: [
            { text: 'Offer to investigate the Shadowlands', destination: 'accept_quest' },
            { text: 'Ask for more details', destination: 'more_details' }
          ],
          tags: ['character:captain_aldric']
        },
        accept_quest: {
          id: 'accept_quest',
          text: `Captain Aldric nods approvingly. "I hoped you'd say that. Take this map - it shows the last known location of our scouts. Start there, but be careful. The forest itself seems to be alive and hostile now."

You receive: Ancient Forest Map
Quest Added: Investigate the Shadowlands`,
          choices: [
            { text: 'Head to the Shadowlands immediately', destination: 'enter_shadowlands' },
            { text: 'Gather supplies first', destination: 'start' }
          ],
          tags: ['quest:accepted', 'item:forest_map']
        },
        enter_shadowlands: {
          id: 'enter_shadowlands',
          text: `As you cross the threshold into the Shadowlands, the world around you changes dramatically. The sun dims to a sickly twilight, shadows move independently of their sources, and an oppressive silence fills the air.

You notice your map glowing faintly - a magical enchantment to help navigate this cursed place. You can see a path leading deeper into the forest.`,
          choices: [
            { text: 'Follow the glowing path', destination: 'forest_path' },
            { text: 'Explore off the beaten track', destination: 'forest_exploration' },
            { text: 'Turn back while you still can', destination: 'start' }
          ],
          tags: ['location:shadowlands']
        },
        tavern_gossip: {
          id: 'tavern_gossip',
          text: `You buy a drink and listen to the hushed conversations around you. The locals speak of strange lights in the forest, missing livestock, and eerie howls in the night.

One patron mentions seeing a figure in dark robes near the forest edge, while another claims the trees themselves have started moving.`,
          choices: [
            { text: 'Ask about the dark-robed figure', destination: 'dark_figure' },
            { text: 'Return to exploring the town', destination: 'start' }
          ],
          tags: ['location:tavern']
        },
        tavern_troubles: {
          id: 'tavern_troubles',
          text: `Marta's expression darkens. "It all started about a month ago. First, the animals started acting strange - refusing to go near the forest. Then people began disappearing. Not many, but enough to worry us all.

The worst part is the dreams. Half the town has been having the same nightmare - a voice calling from the depths of the forest, promising power to those brave enough to answer."`,
          choices: [
            { text: 'Volunteer to investigate', destination: 'volunteer_help' },
            { text: 'Ask more about the dreams', destination: 'dream_details' }
          ],
          tags: ['character:marta']
        },
        merchant_shop: {
          id: 'merchant_shop',
          text: `The merchant shows you his wares: gleaming potions, sturdy weapons, and mysterious trinkets. "Take your pick, adventurer. I'll give you a fair price."

You gain: Health Potion, Iron Sword, Protective Charm
You lose: 50 Gold`,
          choices: [
            { text: 'Thank the merchant and continue', destination: 'start' },
            { text: 'Ask about the Shadowlands', destination: 'merchant_info' }
          ],
          tags: ['item:health_potion', 'item:iron_sword', 'item:protective_charm']
        },
        merchant_info: {
          id: 'merchant_info',
          text: `The merchant's eyes grow wide. "The Shadowlands? That's where the real danger lies, friend. I've heard tell of an ancient evil stirring there - something that was buried long ago but has recently awakened.

If you're planning to venture there, you'll need more than just weapons and potions. You'll need courage, wisdom, and perhaps a bit of divine protection."`,
          choices: [
            { text: 'Thank him for the warning', destination: 'start' },
            { text: 'Ask about divine protection', destination: 'divine_protection' }
          ],
          tags: ['character:merchant']
        },
        forest_path: {
          id: 'forest_path',
          text: `Following the glowing path, you venture deeper into the cursed forest. The trees seem to watch your every move, their branches reaching out like gnarled fingers.

Soon, you come across the remains of a campsite - clearly belonging to the missing scouts. Among the scattered belongings, you find a journal with disturbing entries about 'the voice in the darkness.'`,
          choices: [
            { text: 'Read the journal carefully', destination: 'scout_journal' },
            { text: 'Continue deeper into the forest', destination: 'forest_depths' }
          ],
          tags: ['location:scout_camp', 'item:scout_journal']
        },
        forest_exploration: {
          id: 'forest_exploration',
          text: `Leaving the marked path, you push through the undergrowth and discover something unexpected - a hidden grove where the corruption seems less intense.

In the center of the grove stands an ancient stone circle, still pulsing with a faint, pure light. This might be a place of power that could help in your quest.`,
          choices: [
            { text: 'Investigate the stone circle', destination: 'stone_circle' },
            { text: 'Return to the main path', destination: 'forest_path' }
          ],
          tags: ['location:hidden_grove', 'discovery:stone_circle']
        },
        scout_journal: {
          id: 'scout_journal',
          text: `The journal's final entry reads: "Day 3 - The voice grows stronger. It whispers secrets of power, of ancient knowledge buried beneath the roots of the World Tree. Marcus walked into the darkness last night. I fear I may follow soon. If anyone finds this, tell them the source lies deep in the grove where the great tree once stood."

The rest is illegible, but you now have a destination: the grove of the World Tree.`,
          choices: [
            { text: 'Head to the World Tree grove', destination: 'world_tree_grove' },
            { text: 'Search for more clues first', destination: 'forest_depths' }
          ],
          tags: ['quest:world_tree_location']
        },
        forest_depths: {
          id: 'forest_depths',
          text: `Venturing deeper into the corrupted forest, you encounter increasingly twisted scenery. The trees seem to pulse with malevolent energy, and shadows move independently of any light source.

Eventually, you reach a clearing where an enormous, blackened tree dominates the landscape. This must be the World Tree mentioned in the journal - but it's been corrupted beyond recognition.`,
          choices: [
            { text: 'Approach the corrupted World Tree', destination: 'world_tree_grove' },
            { text: 'Circle around to look for another approach', destination: 'world_tree_grove' }
          ],
          tags: ['location:world_tree_clearing']
        },
        world_tree_grove: {
          id: 'world_tree_grove',
          text: `Standing before the corrupted World Tree, you can feel the malevolent energy radiating from its blackened bark. At its base, you notice a dark opening - as if the earth itself has split open to reveal a passage leading down into darkness.

From the depths comes a whispering voice, beautiful yet terrifying, calling to you with promises of power and knowledge. This is clearly the source of the corruption.`,
          choices: [
            { text: 'Descend into the dark passage', destination: 'final_confrontation' },
            { text: 'Try to seal the opening', destination: 'seal_attempt' },
            { text: 'Retreat and seek help', destination: 'start' }
          ],
          tags: ['location:world_tree', 'boss:malachar_lair']
        },
        final_confrontation: {
          id: 'final_confrontation',
          text: `Descending into the darkness beneath the World Tree, you discover a vast underground chamber. At its center stands a figure wreathed in shadow - the source of the corruption that has plagued the Shadowlands.

"Welcome, brave soul," the figure speaks with the voice from the dreams. "I am Malachar, and I have waited long for one worthy to share in my power. Join me, and together we shall remake this world."`,
          choices: [
            { text: 'Accept Malachar\'s offer', destination: 'dark_ending' },
            { text: 'Challenge Malachar to combat', destination: 'final_battle' },
            { text: 'Try to reason with him', destination: 'negotiate_ending' }
          ],
          tags: ['character:malachar', 'location:underground_chamber']
        },
        final_battle: {
          id: 'final_battle',
          text: `The battle with Malachar is fierce and deadly. Shadow magic clashes against your determination as you fight for the fate of the forest and the town beyond.

Through skill, courage, and perhaps a bit of luck, you manage to land a decisive blow. As Malachar falls, the corruption begins to lift from the forest.

"You... have won this day..." he gasps. "But the darkness... will return..." With his defeat, light begins to return to the Shadowlands.`,
          choices: [
            { text: 'Return to Millbrook as a hero', destination: 'hero_ending' }
          ],
          tags: ['combat:victory', 'quest:completed']
        },
        hero_ending: {
          id: 'hero_ending',
          text: `You emerge from the now-healing forest to find the townspeople of Millbrook gathered at the forest's edge, having seen the light return to the Shadowlands.

Captain Aldric greets you with tears in his eyes. "You did it! The evil has been vanquished!" The town celebrates your victory, and you are hailed as the Hero of Millbrook.

Your adventure in Aethermoor has ended in triumph, but you sense that greater adventures await in the future...

THE END - Victory Achieved!`,
          choices: [
            { text: 'Start a new adventure', destination: 'start' }
          ],
          tags: ['ending:hero']
        },
        dark_ending: {
          id: 'dark_ending',
          text: `You accept Malachar's offer of power, feeling the dark energy flow through you. Together, you and the ancient evil spread corruption throughout the realm.

The Shadowlands expand, consuming Millbrook and beyond. You have gained immense power, but at the cost of your humanity and the world's safety.

THE END - Darkness Reigns`,
          choices: [
            { text: 'Start a new adventure', destination: 'start' }
          ],
          tags: ['ending:dark']
        },
        negotiate_ending: {
          id: 'negotiate_ending',
          text: `Your words reach something deep within Malachar's corrupted soul. After eons of darkness, he remembers what he once was - a guardian of the forest, not its destroyer.

"You... remind me of who I used to be," he says, the shadows lifting from his form. "Perhaps there is another way." Together, you work to heal the Shadowlands rather than rule them.

THE END - Redemption Achieved`,
          choices: [
            { text: 'Start a new adventure', destination: 'start' }
          ],
          tags: ['ending:redemption']
        },
        // Additional nodes for completeness
        more_details: {
          id: 'more_details',
          text: `"The scouts reported seeing twisted creatures that shouldn't exist - shadow wolves with glowing red eyes, trees that whisper in ancient tongues, and worst of all, the missing people wandering the forest as if in a trance."`,
          choices: [
            { text: 'Offer to help', destination: 'accept_quest' },
            { text: 'This sounds too dangerous', destination: 'start' }
          ]
        },
        volunteer_help: {
          id: 'volunteer_help',
          text: `"Bless you, adventurer!" Marta exclaims. "We could surely use someone with your courage. If you're serious about helping, speak to Captain Aldric."`,
          choices: [
            { text: 'Go speak to Captain Aldric', destination: 'guard_conversation' }
          ]
        },
        dark_figure: {
          id: 'dark_figure',
          text: `The patron leans in conspiratorially. "Aye, I saw them with my own eyes. Tall figure in a black robe, standing at the forest's edge just after midnight. When I got closer, they vanished like smoke."`,
          choices: [
            { text: 'This confirms the supernatural threat', destination: 'start' }
          ]
        },
        dream_details: {
          id: 'dream_details',
          text: `"The voice..." Marta shudders. "It's beautiful and terrible at the same time. It speaks of power beyond imagination, of secrets hidden in the depths of the earth. Some folks have started walking toward the forest in their sleep."`,
          choices: [
            { text: 'Volunteer to investigate', destination: 'volunteer_help' }
          ]
        },
        divine_protection: {
          id: 'divine_protection',
          text: `"There's a small shrine on the hill overlooking the town. The local cleric, Sister Elena, tends to it. She knows the old prayers and blessings that might shield you from dark influences."`,
          choices: [
            { text: 'Seek out Sister Elena', destination: 'sister_elena' },
            { text: 'Continue without divine protection', destination: 'start' }
          ]
        },
        sister_elena: {
          id: 'sister_elena',
          text: `You find Sister Elena at the hilltop shrine. She listens to your quest and nods seriously. "Let me grant you a blessing of protection - it may shield you from the worst of the evil influences." You receive: Divine Blessing`,
          choices: [
            { text: 'Thank her and continue your quest', destination: 'start' }
          ],
          tags: ['character:sister_elena', 'item:divine_blessing']
        },
        stone_circle: {
          id: 'stone_circle',
          text: `As you approach the ancient stone circle, you feel a sense of peace and protection. The stones pulse with gentle light - a stark contrast to the darkness surrounding the forest. This circle was once used by druids to contain an ancient evil.`,
          choices: [
            { text: 'Try to strengthen the seal', destination: 'strengthen_seal' },
            { text: 'Continue to the World Tree', destination: 'forest_depths' }
          ],
          tags: ['location:druid_circle', 'magic:protective']
        },
        strengthen_seal: {
          id: 'strengthen_seal',
          text: `Drawing upon your inner strength, you attempt to reinforce the ancient seal. The runes glow brighter, but you sense this is only a temporary measure. The true source of the corruption must still be faced.`,
          choices: [
            { text: 'Continue to the World Tree', destination: 'forest_depths' }
          ],
          tags: ['magic:seal_strengthened']
        },
        seal_attempt: {
          id: 'seal_attempt',
          text: `You attempt to seal the dark opening, but the evil power is too strong. However, your efforts do slow its influence, buying precious time for the people of Millbrook. A more direct approach is needed.`,
          choices: [
            { text: 'Enter the darkness to face the source', destination: 'final_confrontation' }
          ],
          tags: ['magic:partial_seal']
        }
      }
    };
  }

  getCurrentText(): string {
    const node = this.storyData.nodes[this.currentNodeId];
    return node ? node.text : 'Error: Node not found';
  }

  getCurrentChoices() {
    const node = this.storyData.nodes[this.currentNodeId];
    if (!node) return [];
    
    return node.choices.map((choice, index) => ({
      text: choice.text,
      index: index,
      tags: []
    }));
  }

  makeChoice(choiceIndex: number): void {
    const node = this.storyData.nodes[this.currentNodeId];
    if (!node || choiceIndex < 0 || choiceIndex >= node.choices.length) {
      return;
    }

    const choice = node.choices[choiceIndex];
    this.currentNodeId = choice.destination;
    this.saveProgress();
  }

  hasChoices(): boolean {
    const node = this.storyData.nodes[this.currentNodeId];
    return node ? node.choices.length > 0 : false;
  }

  canContinue(): boolean {
    return false; // Custom engine doesn't use continue mechanism like Ink
  }

  getTags(): string[] {
    const node = this.storyData.nodes[this.currentNodeId];
    return node ? node.tags || [] : [];
  }

  getVariable(name: string): any {
    return this.variables[name];
  }

  setVariable(name: string, value: any): void {
    this.variables[name] = value;
    this.saveProgress();
  }

  saveProgress(): void {
    const saveData = {
      currentNodeId: this.currentNodeId,
      variables: this.variables,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.saveKey, JSON.stringify(saveData));
  }

  loadProgress(): void {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (savedData) {
        const { currentNodeId, variables } = JSON.parse(savedData);
        this.currentNodeId = currentNodeId || this.storyData.startNode;
        this.variables = { ...this.storyData.variables, ...variables };
      }
    } catch (error) {
      console.warn('Failed to load story progress:', error);
    }
  }

  resetStory(): void {
    this.currentNodeId = this.storyData.startNode;
    this.variables = { ...this.storyData.variables };
    localStorage.removeItem(this.saveKey);
  }

  getCurrentPath(): string {
    return this.currentNodeId;
  }

  getStoryStats() {
    return {
      canContinue: this.canContinue(),
      hasChoices: this.hasChoices(),
      choiceCount: this.getCurrentChoices().length,
      currentTags: this.getTags(),
      currentPath: this.getCurrentPath()
    };
  }
}