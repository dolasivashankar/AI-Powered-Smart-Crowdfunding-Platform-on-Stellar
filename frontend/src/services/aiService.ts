import type { AIGenerateParams } from '@/types';

export class AIService {
  async generateDescription(params: AIGenerateParams): Promise<string> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    const enableAI = import.meta.env.VITE_ENABLE_AI_DESCRIPTIONS === 'true';

    if (!enableAI) {
      return this.mockGenerate(params);
    }

    if (!apiKey) {
      console.warn('VITE_OPENAI_API_KEY is not defined. Using mock AI generation.');
      return this.mockGenerate(params);
    }

    const model = import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini';
    const baseUrl = import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional copywriter specialized in Web3 crowdfunding and blockchain campaign promotion. Generate clean, highly engaging markdown descriptions for campaigns.',
            },
            {
              role: 'user',
              content: `Create a compelling 3-paragraph crowdfunding campaign description for a project named "${params.title}" in the "${params.category}" category.
              Target Goal: ${params.goalAmount} XLM.
              Key Highlights to include:
              ${params.highlights.map((h) => `- ${h}`).join('\n')}
              Make it look premium, professional, and specify how blockchain transparency will be utilized.`,
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Service HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || this.mockGenerate(params);
    } catch (error) {
      console.error('Failed to generate with OpenAI API:', error);
      return this.mockGenerate(params);
    }
  }

  private mockGenerate(params: AIGenerateParams): string {
    const highlightsText = params.highlights.length > 0
      ? params.highlights.map((h) => `• **${h}**`).join('\n')
      : '• **Transparency:** Fully audited smart contracts releasing funds strictly on milestone completion.\n• **Community-Driven:** Backers hold voting rights to approve subsequent development stages.\n• **Low Fees:** Leveraging Stellar’s sub-cent transactions to maximize direct funding.';

    return `### About ${params.title}

Welcome to the future of decentralized funding in the **${params.category}** sector! ${params.title} is a groundbreaking initiative designed to revolutionize how we approach community projects. By harnessing the Stellar blockchain, we are raising a target of **${params.goalAmount} XLM** with 100% transparency, making every donation visible on-chain.

### Key Milestones & Benefits

${highlightsText}

### Why Support Us?

Traditional crowdfunding platforms charge exorbitant fees and offer zero guarantees that creators will deliver. With our **StellarFlow AI Escrow** contract, your funds are locked securely and only released when we meet concrete development milestones. If we fail to deliver, you can claim a full refund. Back this campaign today and help us bring this vision to life!`;
  }
}

export const aiService = new AIService();
