import { escapeHtml, renderStyles } from "../utils/render-utils.js";
import { renderInlineText } from "../utils/inline-text.js";

export function renderForm(block) {
  const provider = String(block.data.provider || "").toLowerCase();
  const classes = ["form-block", "block-form", renderStyles(block)].filter(Boolean).join(" ");
  const fields = block.data.fields.map((field, index) => renderFormField(field, index)).join("");
  const providerHiddenFields = provider === "formspree"
    ? `
      <input type="hidden" name="_subject" value="New contact form submission from portfolio" />
      <input type="hidden" name="_language" value="en" />
      <input type="text" name="_gotcha" class="form-bottrap" tabindex="-1" autocomplete="off" aria-hidden="true" />
    `
    : "";
  const captchaMarkup = provider === "formspree"
    ? `
      <fieldset class="captcha-fieldset" data-simple-captcha>
        <legend>${renderInlineText("Human Verification", { convertLineBreaks: false })}</legend>
        <p class="captcha-hint">${renderInlineText("Solve this quick challenge to continue.", { convertLineBreaks: false })}</p>
        <label>
          <span class="captcha-question">Loading challenge...</span>
          <input type="text" class="captcha-input" inputmode="numeric" required />
        </label>
      </fieldset>
    `
    : "";

  return `
    <form class="${classes}"
          method="POST"
          action="${escapeHtml(block.data.endpoint)}"
          accept-charset="UTF-8"
          data-form-provider="${escapeHtml(provider)}">
      ${providerHiddenFields}
      ${fields}
      ${captchaMarkup}
      <button type="submit">${renderInlineText("Send", { convertLineBreaks: false })}</button>
    </form>
  `;
}

function renderFormField(field, index) {
  const fieldId = `field-${escapeHtml(normalizeFieldName(field.name || `field-${index}`))}-${index}`;
  const inputType = field.type || "text";
  const required = field.required ? "required" : "";
  const requiredMark = field.required ? '<span class="form-required" aria-hidden="true">*</span>' : "";
  const requiredScreenReaderText = field.required ? '<span class="sr-only">(required)</span>' : "";
  const validationAttrs = renderValidationAttributes(field);
  const describedBy = [];

  if (field.helpText) {
    describedBy.push(`${fieldId}-help`);
  }
  describedBy.push(`${fieldId}-error`);
  const describedByAttr = `aria-describedby="${describedBy.join(" ")}"`;

  const controlMarkup = inputType === "textarea"
    ? `<textarea id="${fieldId}" name="${escapeHtml(field.name)}" ${required} ${describedByAttr} ${validationAttrs}></textarea>`
    : `<input id="${fieldId}" type="${escapeHtml(inputType)}" name="${escapeHtml(field.name)}" ${required} ${describedByAttr} ${validationAttrs} />`;

  return `
    <div class="form-field">
      <label for="${fieldId}" class="form-label">
        <span class="form-label-text">${renderInlineText(field.label, { convertLineBreaks: false, parseLinks: false })}</span>
        ${requiredMark}
        ${requiredScreenReaderText}
      </label>
      ${controlMarkup}
      ${field.helpText ? `<p id="${fieldId}-help" class="form-help">${renderInlineText(field.helpText, { parseLinks: false })}</p>` : ""}
      <p id="${fieldId}-error" class="form-error" aria-live="polite" hidden></p>
    </div>
  `;
}

function renderValidationAttributes(field) {
  const attrs = [];
  const validation = field.validation || {};
  const messages = field.messages || {};

  if (field.placeholder) attrs.push(`placeholder="${escapeHtml(field.placeholder)}"`);
  if (field.autocomplete) attrs.push(`autocomplete="${escapeHtml(field.autocomplete)}"`);

  if (Number.isInteger(validation.minLength)) attrs.push(`minlength="${validation.minLength}"`);
  if (Number.isInteger(validation.maxLength)) attrs.push(`maxlength="${validation.maxLength}"`);
  if (typeof validation.pattern === "string" && validation.pattern.length > 0) {
    attrs.push(`pattern="${escapeHtml(validation.pattern)}"`);
  }
  if (typeof validation.min === "number") attrs.push(`min="${validation.min}"`);
  if (typeof validation.max === "number") attrs.push(`max="${validation.max}"`);
  if (typeof validation.step === "number") attrs.push(`step="${validation.step}"`);

  const messageKeys = [
    "required",
    "typeMismatch",
    "patternMismatch",
    "tooShort",
    "tooLong",
    "rangeUnderflow",
    "rangeOverflow"
  ];

  messageKeys.forEach((key) => {
    if (typeof messages[key] === "string" && messages[key].trim()) {
      attrs.push(`data-error-${key}="${escapeHtml(messages[key])}"`);
    }
  });

  attrs.push("data-validation-target=\"true\"");
  return attrs.join(" ");
}

function normalizeFieldName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\-_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
