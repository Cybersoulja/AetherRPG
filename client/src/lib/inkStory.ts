/**
 * A wrapper around the inkjs story engine.
 * This class is responsible for managing the story flow, choices, and variables.
 */
import { Story } from 'inkjs';
import storyContent from '../data/story.ink.json';

export class InkStoryEngine {
  private story: Story;
  private saveKey = 'rpg_story_save';

  constructor() {
    try {
      console.log('Initializing Ink Story with content:', storyContent);
      this.story = new Story(storyContent);
      console.log('Story initialized successfully');
      this.loadProgress();
    } catch (error) {
      console.error('Failed to initialize Ink Story:', error);
      throw error;
    }
  }

  continue(): string {
    if (this.story.canContinue) {
      return this.story.Continue() || '';
    }
    return '';
  }

  getAllText(): string {
    let text = '';
    while (this.story.canContinue) {
      text += this.story.Continue();
    }
    return text;
  }

  getCurrentChoices() {
    return this.story.currentChoices.map((choice, index) => ({
      text: choice.text,
      index: index,
      tags: choice.tags || []
    }));
  }

  makeChoice(choiceIndex: number): void {
    if (choiceIndex >= 0 && choiceIndex < this.story.currentChoices.length) {
      this.story.ChooseChoiceIndex(choiceIndex);
      this.saveProgress();
    }
  }

  getVariable(variableName: string): any {
    return this.story.variablesState[variableName];
  }

  setVariable(variableName: string, value: any): void {
    this.story.variablesState[variableName] = value;
    this.saveProgress();
  }

  getTags(): string[] {
    return this.story.currentTags || [];
  }

  hasChoices(): boolean {
    return this.story.currentChoices.length > 0;
  }

  canContinue(): boolean {
    return this.story.canContinue;
  }

  saveProgress(): void {
    const saveData = {
      storyState: this.story.state.toJson(),
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.saveKey, JSON.stringify(saveData));
  }

  loadProgress(): void {
    try {
      const savedData = localStorage.getItem(this.saveKey);
      if (savedData) {
        const { storyState } = JSON.parse(savedData);
        this.story.state.LoadJson(storyState);
      }
    } catch (error) {
      console.warn('Failed to load story progress:', error);
    }
  }

  resetStory(): void {
    this.story = new Story(storyContent);
    localStorage.removeItem(this.saveKey);
  }

  getCurrentPath(): string {
    // Return current story path/location for UI purposes
    const tags = this.getTags();
    const locationTag = tags.find(tag => tag.startsWith('location:'));
    return locationTag ? locationTag.replace('location:', '') : 'unknown';
  }

  getStoryStats() {
    return {
      canContinue: this.canContinue(),
      hasChoices: this.hasChoices(),
      choiceCount: this.story.currentChoices.length,
      currentTags: this.getTags(),
      currentPath: this.getCurrentPath()
    };
  }
}
