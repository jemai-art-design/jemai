const INK = "#252525";
const QUIET = "#8e8e8e";
const RULE = "#e5e5e5";
const BODY_FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const HEADING_FONT = "Georgia, 'Times New Roman', serif";

export type EmailContent = {
  /** The line under the subject in an inbox list. Kept out of the visible body. */
  preview: string;
  heading: string;
  /** One string per paragraph. Plain text — it is escaped before it is drawn. */
  paragraphs: string[];
  action?: { label: string; url: string; };
  /**
   * A labelled block under the copy — an order's lines and totals, a request's
   * own details. `strong` is for the row a reader looks for first: the total.
   */
  summary?: { title?: string; rows: SummaryRow[]; };
  /** Small print under the rule: what to do if the mail was unexpected, and why. */
  footnotes?: string[];
};

export type SummaryRow = { label: string; value: string; strong?: boolean; };

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const paragraph = (text: string) =>
  `<p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:16px;line-height:26px;color:${INK};">${escape(text)}</p>`;

const button = ({ label, url }: { label: string; url: string; }) => `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
        <tr>
          <td style="background-color:${INK};">
            <a href="${escape(url)}" style="display:inline-block;padding:12px 28px;font-family:${BODY_FONT};font-size:15px;font-weight:600;line-height:20px;color:#ffffff;text-decoration:none;">${escape(label)}</a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-family:${BODY_FONT};font-size:13px;line-height:22px;color:${QUIET};">Or paste this into your browser:<br /><a href="${escape(url)}" style="color:${INK};word-break:break-all;">${escape(url)}</a></p>`;

/**
 * A row's own layout depends on what it carries. A price sits opposite its
 * label, where a reader's eye runs down the column of numbers; a paragraph — an
 * enquiry's message, a delivery address — cannot, so it stacks under its label
 * instead of squeezing a column to nothing.
 */
const STACK_ABOVE = 40;

const cell = (strong?: boolean) =>
  `padding:10px 0;border-bottom:1px solid ${RULE};font-family:${BODY_FONT};font-size:15px;line-height:22px;color:${INK};font-weight:${strong ? 600 : 400};`;

const summaryRow = ({ label, value, strong }: SummaryRow) =>
  value.length > STACK_ABOVE
    ? `<tr>
          <td colspan="2" style="${cell(strong)}"><span style="color:${QUIET};">${escape(label)}</span><br />${escape(value)}</td>
        </tr>`
    : `<tr>
          <td class="sr-label" style="${cell(strong)}word-break:break-word;">${escape(label)}</td>
          <td class="sr-value" align="right" style="${cell(strong)}padding-left:16px;white-space:nowrap;">${escape(value)}</td>
        </tr>`;

const summaryBlock = ({ title, rows }: { title?: string; rows: SummaryRow[]; }) => `
      ${title ? `<p style="margin:0 0 8px;font-family:${BODY_FONT};font-size:13px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${QUIET};">${escape(title)}</p>` : ""}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:0 0 24px;border-top:1px solid ${RULE};">
        ${rows.map(summaryRow).join("\n        ")}
      </table>`;

const footnote = (text: string) =>
  `<p style="margin:0 0 8px;font-family:${BODY_FONT};font-size:13px;line-height:22px;color:${QUIET};">${escape(text)}</p>`;

/**
 * Renders `content` into the pair `sendMail` takes. Both halves carry the same
 * words: a client that refuses HTML, and a screen reader on the text part, get
 * the link written out rather than a button they cannot press.
 */
export const renderEmail = ({
  preview,
  heading,
  paragraphs,
  action,
  summary,
  footnotes = [],
}: EmailContent) => {
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(heading)}</title>
    <style>
      /* On a narrow screen a label and its right-aligned value cannot share a
         row without squeezing one to nothing, so stack the value under its
         label — the same shape a long value already takes on every width. */
      @media only screen and (max-width:480px) {
        .sr-label, .sr-value {
          display:block !important;
          width:100% !important;
          text-align:left !important;
          white-space:normal !important;
          padding-left:0 !important;
        }
        .sr-label {
          padding-bottom:0 !important;
          border-bottom:none !important;
          color:${QUIET} !important;
        }
        .sr-value {
          padding-top:2px !important;
        }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f6f6f4;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f6f6f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background-color:#ffffff;">
            <tr>
              <td style="padding:40px 40px 32px;">
                <p style="margin:0 0 32px;font-family:${HEADING_FONT};font-size:20px;letter-spacing:0.18em;color:${INK};text-transform:uppercase;">JEMAI</p>
                <h1 style="margin:0 0 20px;font-family:${HEADING_FONT};font-size:26px;line-height:34px;font-weight:normal;color:${INK};">${escape(heading)}</h1>
                ${paragraphs.map(paragraph).join("\n                ")}
                ${summary && summary.rows.length ? summaryBlock(summary) : ""}
                ${action ? button(action) : ""}
                ${footnotes.length
      ? `<hr style="border:none;border-top:1px solid ${RULE};margin:24px 0;" />
                ${footnotes.map(footnote).join("\n                ")}`
      : ""
    }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "JEMAI",
    "",
    heading,
    "",
    ...paragraphs,
    ...(summary && summary.rows.length
      ? [
        "",
        ...(summary.title ? [summary.title.toUpperCase()] : []),
        ...summary.rows.map(({ label, value }) => `${label}: ${value}`),
      ]
      : []),
    ...(action ? ["", `${action.label}: ${action.url}`] : []),
    ...(footnotes.length ? ["", ...footnotes] : []),
  ].join("\n");

  return { html, text };
};
