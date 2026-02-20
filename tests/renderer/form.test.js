import { describe, it, expect } from "vitest";
import { renderForm } from "../../scripts/core/components/form.js";

describe("renderForm", () => {
    it("renders a form", () => {
        const form = {
            type: "form",
            data: {
            provider: "formspree",
            endpoint: "/contact",
            fields: [
                {
                    name: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                    validation: { minLength: 6 },
                    messages: { required: "Email is required." }
                },
                { name: "message", label: "Message", type: "textarea" }
            ]
            }
        };

        const html = renderForm(form);
        expect(html).toContain("<form");
        expect(html).toContain("textarea");
        expect(html).toContain("Email");
        expect(html).toContain("_subject");
        expect(html).toContain('class="form-block block-form');
        expect(html).toContain('class="form-required"');
        expect(html).toContain('data-error-required="Email is required."');
    });
});

