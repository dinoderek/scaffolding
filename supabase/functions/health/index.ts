// Minimal local runtime smoke endpoint for M5 backend bring-up.
Deno.serve((_req) => {
  const body = {
    ok: true,
    service: Deno.env.get("APP_NAME") ?? "BOGA-backend",
    environment: Deno.env.get("APP_ENV") ?? "local",
    apiSurface: "edge-function-health-smoke",
    note: "M5 local health endpoint only; final sync API surface remains task-owned by T-20260220-11.",
    now: new Date().toISOString(),
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
});
