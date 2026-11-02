export const dynamic = "force-dynamic";

function healthResponse() {
  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

export function GET() {
  return healthResponse();
}
