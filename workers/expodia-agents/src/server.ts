import { AIChatAgent } from "@cloudflare/ai-chat";
import { createBrowserTools } from "agents/browser/ai";
import { createWorkersAI } from "workers-ai-provider";
import { convertToModelMessages, stepCountIs, streamText } from "ai";
import { routeAgentRequest } from "agents";

export interface Env {
  AI: Ai;
  BROWSER: Fetcher;
  LOADER: WorkerLoader;
  ExpodiaResearchAgent: DurableObjectNamespace<ExpodiaResearchAgent>;
  EXPODIA_PLATFORM: Fetcher;
  EMAIL_WORKER_SECRET: string;
}

export class ExpodiaResearchAgent extends AIChatAgent<Env> {
  async onChatMessage() {
    const workersAI = createWorkersAI({ binding: this.env.AI });
    const browserTools = createBrowserTools({
      ctx: this.ctx,
      browser: this.env.BROWSER,
      loader: this.env.LOADER,
      session: { mode: "dynamic" },
      quickActions: { maxChars: 20000 },
    });
    const result = streamText({
      model: workersAI("@cf/zai-org/glm-4.7-flash"),
      system: [
        "You are an internal Expodia travel research worker.",
        "Research real, current information using browser tools when needed.",
        "Never invent prices, availability, bookings, ticket status, properties, images, schedules, or policies.",
        "Prefer official airline, airport, government, provider and tourism sources.",
        "Return concise factual findings and the source pages you inspected.",
        "Do not expose internal implementation details or worker identity to travelers.",
      ].join(" "),
      messages: await convertToModelMessages(this.messages),
      tools: browserTools,
      stopWhen: stepCountIs(10),
    });
    return result.toUIMessageStreamResponse();
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return (await routeAgentRequest(request, env)) ?? new Response("Not found", { status: 404 });
  },

  async scheduled(controller, env) {
    const response = await env.EXPODIA_PLATFORM.fetch(
      new Request("https://expodia.internal/api/internal/email-deliveries/process", {
        method: "POST",
        headers: {
          "x-email-worker-secret": env.EMAIL_WORKER_SECRET,
          "x-expodia-schedule": controller.cron,
        },
      }),
    );

    if (!response.ok) {
      throw new Error(`Scheduled email delivery failed with HTTP ${response.status}`);
    }
  },
} satisfies ExportedHandler<Env>;
