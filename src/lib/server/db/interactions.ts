import { eq } from "drizzle-orm";
import { getDb } from "./client";
import { interactions } from "./schema";
import { AzureOpenAI } from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AZURE_OPENAI_API_KEY, AZURE_OPENAI_DEPLOYMENT, AZURE_OPENAI_ENDPOINT } from "$env/static/private";
import prompt from "../prompt.txt?raw"
import rawPersonas from "../personas.yaml?raw";
import { parse } from "yaml";

const apiKey = AZURE_OPENAI_API_KEY;
const endpoint = AZURE_OPENAI_ENDPOINT;
const apiVersion = "2024-10-21";

if (!apiKey || !endpoint) {
    throw new Error("Missing Azure OpenAI config. Set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in .env.");
}

const client =  new AzureOpenAI({
    apiKey,
    endpoint,
    apiVersion
});

const personas: Record<string, { prompt: string }> = parse(rawPersonas);

export const createInteraction = async (data: typeof interactions.$inferInsert) =>
    (await getDb().insert(interactions).values(data).returning())[0];

export const getInteraction = async (id: string) =>
    (await getDb().select().from(interactions).where(eq(interactions.id, id)))[0];

export const getInteractionsByRoomId = async (roomId: string) =>
    await getDb().select().from(interactions).where(eq(interactions.roomId, roomId));

export const addMessagesToInteraction = async (id: string, messages: typeof interactions.$inferSelect['messages']) => {
    const interaction = await getInteraction(id);
    if (!interaction) {
        throw new Error('Interaction not found');
    }
    const updatedMessages = [...interaction.messages, ...messages];
    await getDb().update(interactions).set({ messages: updatedMessages }).where(eq(interactions.id, id));
}

export const completeInteraction = async (id: string) => {
    await getDb().update(interactions).set({ completed: 1 }).where(eq(interactions.id, id));
}

export const getOrStartInteraction = async (data: typeof interactions.$inferInsert, personaKey: string) => {
    const existingInteractions = await getInteraction(data.id);
    const interaction = new Interaction(data, personaKey, existingInteractions?.messages, existingInteractions?.completed === 1);
    if (!existingInteractions) {
        await interaction.generateResponse();
        data.messages = interaction.messages;
        await createInteraction(data);
    }
    return interaction;
}

class Interaction {
    private deployment: string;
    private _messages: ChatCompletionMessageParam[];
    private interactionData: typeof interactions.$inferInsert;
    private _completed;

    constructor(
        data: typeof interactions.$inferInsert, 
        personaKey: string, 
        existingMessages?: ChatCompletionMessageParam[],
        completed = false
    ) {
        const deployment = AZURE_OPENAI_DEPLOYMENT;

        if (!deployment) {
            throw new Error("Missing AZURE_OPENAI_DEPLOYMENT in .env.");
        }

        this.deployment = deployment;
        this._messages = existingMessages || [
            { role: "system", content: prompt },
            { role: "system", content: personas[personaKey].prompt },
            { role: "user", content: "Hello! Welcome to the IPL! How can I help?" }
        ];
        this.interactionData = data;
        this._completed = completed;
    }

    public get messages() {
        return this._messages;
    }

    public async generateResponse(): Promise<{ response: string; interactionCompleted: boolean }> {
        const response =  await client.chat.completions.create({
            model: this.deployment,
            messages: this.messages,
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'StudentResponse',
                    schema: {
                        type: 'object',
                        properties: {
                            response: {
                                type: 'string',
                                description: 'The response from the student to the TA. This should be a single sentence, and should reflect the persona described in the system message.'
                            },
                            interactionCompleted: {
                                type: 'boolean',
                                description: 'Whether the interaction is complete. This should be true if the student has been sufficiently helped and is no longer asking for help, and false if the student is still asking for help.'
                            }
                        },
                        required: ['response', 'interactionCompleted']
                    }
                }
            }
        });
        const rawContent = response.choices[0]?.message?.content;
        if (!rawContent) {
            throw new Error("No content in response");
        }
        let parsedContent: 
            { response: string; interactionCompleted: boolean } | 
            { type: "object"; properties: { response: string; interactionCompleted: boolean }} | null;
        try {
            parsedContent
                    = rawContent ? JSON.parse(rawContent) : null;
        } catch {
            console.error("Failed to parse response content as JSON:", rawContent);
            return this.generateResponse();
        }
        if (!parsedContent) {
            return this.generateResponse();
        }
        if ('type' in parsedContent) {
            parsedContent = {
                response: parsedContent.properties.response,
                interactionCompleted: parsedContent.properties.interactionCompleted
            }
        }
        if (parsedContent) {
            this._messages.push({ role: "assistant", content: parsedContent.response });
            if (parsedContent.interactionCompleted) {
                this._completed = true;
                await completeInteraction(this.interactionData.id);
            }
        }
        return parsedContent;
    }

    get completed() {
        return this._completed;
    }

    public async respond(message: ChatCompletionMessageParam) {
        this._messages.push(message);
        const response = await this.generateResponse();
        await addMessagesToInteraction(this.interactionData.id, [message, { role: "assistant", content: response?.response || "" }]);
        return response;
    }
}