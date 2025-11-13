import { googleAI } from '@genkit-ai/google-genai';
import { genkit, z } from 'genkit';

// Initialize Genkit with the Google AI plugin
const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.5-flash', {
        temperature: 0.8,
    }),
});

// Define input schema
const InputSchema = z.object({
    message: z.string().describe('The hello message to send to Gemini'),
});

// Define output schema
const OutputSchema = z.object({
    response: z.string().describe('The response from Gemini'),
});

// Define a gemini usage checker flow
export const geminiUsageCheckerFlow = ai.defineFlow(
    {
        name: 'geminiUsageCheckerFlow',
        inputSchema: InputSchema,
        outputSchema: OutputSchema,
    },
    async (input) => {
        // Create a prompt based on the input
        const prompt = input.message;

        // Generate structured recipe data using the same schema
        const { output } = await ai.generate({
            prompt,
            output: { schema: OutputSchema },
        });

        if (!output) throw new Error('Failed to check Gemini usage');

        return output;
    },
);

// Run the flow
async function main() {
    const geminiResponse = await geminiUsageCheckerFlow({
        message: "Who are you?"
    });
    console.log(geminiResponse);
}

main().catch(console.error);