import { confirmWithDialog } from "./dialog.js";

export function initFormValidation() {
  document.querySelectorAll("form.form-block [data-validation-target='true']").forEach((field) => {
    const errorNodeId = field.getAttribute("aria-describedby")?.split(" ").find((id) => id.endsWith("-error"));
    const errorNode = errorNodeId ? document.getElementById(errorNodeId) : null;

    function resolveMessage() {
      const validity = field.validity;
      if (validity.valueMissing) return field.dataset.errorRequired || "";
      if (validity.typeMismatch) return field.dataset.errorTypeMismatch || "";
      if (validity.patternMismatch) return field.dataset.errorPatternMismatch || "";
      if (validity.tooShort) return field.dataset.errorTooShort || "";
      if (validity.tooLong) return field.dataset.errorTooLong || "";
      if (validity.rangeUnderflow) return field.dataset.errorRangeUnderflow || "";
      if (validity.rangeOverflow) return field.dataset.errorRangeOverflow || "";
      return "";
    }

    function showError(message) {
      if (!errorNode) return;
      if (!message) {
        errorNode.hidden = true;
        errorNode.textContent = "";
        return;
      }
      errorNode.hidden = false;
      errorNode.textContent = message;
    }

    field.addEventListener("invalid", () => {
      const message = resolveMessage();
      field.setCustomValidity(message || "");
      showError(message);
    });

    field.addEventListener("input", () => {
      field.setCustomValidity("");
      showError("");
    });

    field.addEventListener("blur", () => {
      if (!field.checkValidity()) {
        const message = resolveMessage();
        field.setCustomValidity(message || "");
        showError(message);
      } else {
        showError("");
      }
    });
  });
}

export function initFormSecurity() {
  document.querySelectorAll("form.form-block[data-form-provider='formspree']").forEach((form) => {
    const captchaFieldset = form.querySelector("[data-simple-captcha]");
    const questionNode = captchaFieldset?.querySelector(".captcha-question");
    const inputNode = captchaFieldset?.querySelector(".captcha-input");
    let expectedAnswer = null;
    let isSubmitting = false;

    if (questionNode && inputNode) {
      const a = Math.floor(Math.random() * 8) + 1;
      const b = Math.floor(Math.random() * 8) + 1;
      expectedAnswer = a + b;
      questionNode.textContent = `What is ${a} + ${b}?`;
    }

    form.addEventListener("submit", async (event) => {
      if (isSubmitting) return;

      if (expectedAnswer !== null && inputNode) {
        const userAnswer = Number.parseInt(inputNode.value.trim(), 10);
        if (Number.isNaN(userAnswer) || userAnswer !== expectedAnswer) {
          event.preventDefault();
          inputNode.setCustomValidity("Incorrect answer. Please solve the challenge.");
          inputNode.reportValidity();
          return;
        }
        inputNode.setCustomValidity("");
      }

      event.preventDefault();
      const confirmed = await confirmWithDialog(
        "Your message will be submitted now. Continue?",
        { title: "Submit Form", confirmLabel: "Submit", cancelLabel: "Review" }
      );

      if (!confirmed) return;

      isSubmitting = true;
      form.requestSubmit();
    });
  });
}
