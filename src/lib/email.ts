export async function sendAlertEmail({
  to,
  ticker,
  stockName,
  targetPrice,
  currentPrice,
  direction,
}: {
  to: string;
  ticker: string;
  stockName: string;
  targetPrice: number;
  currentPrice: number;
  direction: "above" | "below";
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey === "replace_me") return; // email not configured

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const pnl = (((currentPrice - targetPrice) / targetPrice) * 100).toFixed(1);
  const subject = `🔔 Alert: ${stockName} (${ticker}) is ${direction} ₹${targetPrice}`;

  await resend.emails.send({
    from: "3S Stock Finder <alerts@3sstock.in>",
    to,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#1e293b">Price Alert Triggered</h2>
        <p><strong>${stockName}</strong> (${ticker}) has crossed your target.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#64748b">Current Price</td><td style="padding:8px;font-weight:bold">₹${currentPrice.toFixed(0)}</td></tr>
          <tr><td style="padding:8px;color:#64748b">Your Target</td><td style="padding:8px">₹${targetPrice.toFixed(0)} (${direction})</td></tr>
          <tr><td style="padding:8px;color:#64748b">Move</td><td style="padding:8px;color:${parseFloat(pnl) >= 0 ? "#059669" : "#dc2626"}">${pnl}%</td></tr>
        </table>
        <a href="https://3cardtrick.vercel.app" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none">View on 3S Stock Finder</a>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">This is not financial advice. 3S Stock Finder, NSE/BSE data via Yahoo Finance.</p>
      </div>
    `,
  });
}
