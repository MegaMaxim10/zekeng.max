const DIALOG_ID = "framework-confirm-dialog";

export function confirmWithDialog(message, options = {}) {
  const dialog = ensureDialog();
  const title = options.title || "Confirm Submission";
  const confirmLabel = options.confirmLabel || "Continue";
  const cancelLabel = options.cancelLabel || "Cancel";

  const titleNode = dialog.querySelector("[data-dialog-title]");
  const messageNode = dialog.querySelector("[data-dialog-message]");
  const confirmButton = dialog.querySelector("[data-dialog-confirm]");
  const cancelButton = dialog.querySelector("[data-dialog-cancel]");

  titleNode.textContent = title;
  messageNode.textContent = message;
  confirmButton.textContent = confirmLabel;
  cancelButton.textContent = cancelLabel;

  return new Promise((resolve) => {
    function onCancel(event) {
      event.preventDefault();
      cleanup();
      closeDialog(dialog);
      resolve(false);
    }

    function onConfirm() {
      cleanup();
      closeDialog(dialog);
      resolve(true);
    }

    function onClose() {
      cleanup();
      resolve(dialog.returnValue === "confirm");
    }

    function cleanup() {
      cancelButton.removeEventListener("click", onCancel);
      confirmButton.removeEventListener("click", onConfirm);
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("close", onClose);
    }

    cancelButton.addEventListener("click", onCancel);
    confirmButton.addEventListener("click", onConfirm);
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("close", onClose);

    openDialog(dialog);
  });
}

function ensureDialog() {
  let dialog = document.getElementById(DIALOG_ID);
  if (dialog) return dialog;

  dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "framework-dialog";
  dialog.innerHTML = `
    <form method="dialog" class="framework-dialog-content">
      <h2 class="framework-dialog-title" data-dialog-title></h2>
      <p class="framework-dialog-message" data-dialog-message></p>
      <div class="framework-dialog-actions">
        <button type="button" class="framework-dialog-btn is-secondary" data-dialog-cancel>Cancel</button>
        <button type="button" class="framework-dialog-btn is-primary" data-dialog-confirm>Continue</button>
      </div>
    </form>
  `;

  document.body.append(dialog);
  return dialog;
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    return;
  }
  dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") {
    dialog.close();
    return;
  }
  dialog.removeAttribute("open");
}
