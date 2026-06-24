import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token') || 'HPU-PASS';
  const event = searchParams.get('event') || 'HPU Event';
  const host = searchParams.get('host') || 'Greek Life';

  // In production, your Apple Certificate creates a binary .pkpass file here.
  // For your local MVP testing, we generate a structured JSON voucher asset 
  // that mirrors the exact dictionary headers Apple's PassKit server expects.
  const passManifest = {
    passTypeIdentifier: "pass.com.functionfndr.tickets",
    teamIdentifier: "HPU_LAUNCH_2026",
    organizationName: "FunctionFNDR",
    serialNumber: token,
    description: `${event} Ticket`,
    backgroundColor: "rgb(13, 13, 17)", // Midnight Obsidian
    foregroundColor: "rgb(255, 255, 255)",
    labelColor: "rgb(57, 255, 20)", // Toxic Neon Lime
    eventTicket: {
      primaryFields: [{ key: "event", label: "EVENT", value: event }],
      secondaryFields: [{ key: "host", label: "ORGANIZER", value: host }],
      auxiliaryFields: [{ key: "gate", label: "ENTRY CODE", value: token }]
    }
  };

  const jsonString = JSON.stringify(passManifest, null, 2);

  // Return this directly to the browser as a downloadable pass config file layout
  return new NextResponse(jsonString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="ticket-${token}.pkpass.json"`,
    },
  });
}
