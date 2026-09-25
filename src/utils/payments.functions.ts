import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { gatewayFetch } from "@/lib/paddle.server";

/** Only the app's own plans can be resolved; arbitrary lookups are rejected. */
const resolveSchema = z.object({
  priceId: z.enum(["premium_monthly", "premium_yearly"]),
  environment: z.enum(["sandbox", "live"]),
});

export const resolvePaddlePrice = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => resolveSchema.parse(data))
  .handler(async ({ data }) => {
    const response = await gatewayFetch(
      data.environment,
      `/prices?external_id=${encodeURIComponent(data.priceId)}`,
    );
    const result = await response.json();
    if (!result.data?.length) throw new Error("Price not found");
    return result.data[0].id as string;
  });
