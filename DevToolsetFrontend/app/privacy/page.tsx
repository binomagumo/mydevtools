import { PrivacyBackLink } from "@/components/privacy-back-link";
import { ToolLayout } from "@/components/tool-layout";

export const metadata = {
  title: "Privacy — DevToolset",
  description: "How DevToolset handles tool input and operational metadata.",
};

export default function PrivacyPage() {
  return (
    <ToolLayout className="max-w-3xl">
      <PrivacyBackLink />
      <div className="mt-6 min-w-0">
        <h1 className="text-2xl font-semibold text-foreground">Privacy</h1>
        <div className="mt-6 space-y-6 text-sm leading-relaxed text-secondary">
          <p>
            DevToolset is a developer utility application designed with a
            privacy-conscious approach.
          </p>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">
              What we collect
            </h2>
            <p>
              DevToolset does not require an account for normal use and does not
              intentionally collect personal information for normal tool usage.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">
              Tool input
            </h2>
            <p>
              When a tool uses the DevToolset API, the input is transmitted to
              the API to perform the requested operation.
            </p>
            <p className="mt-2">
              DevToolset does not intentionally persist submitted tool input.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">
              Operational data
            </h2>
            <p>
              The hosting platform may process basic operational metadata such
              as request time, status, latency, service health, and network
              information needed to operate and protect the service.
            </p>
            <p className="mt-2">
              Application logs are configured not to include request bodies,
              JWTs, secrets, or generated tool output. Log retention depends on
              the production hosting configuration.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">
              What we do not do
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>We do not sell submitted content.</li>
              <li>We do not require registration.</li>
              <li>
                We do not create user profiles from normal tool usage.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">
              Local processing
            </h2>
            <p>
              Some tools may eventually be implemented entirely in the browser.
              When a tool is locally processed, the input does not need to be
              sent to the API.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-base font-medium text-foreground">
              Questions
            </h2>
            <p>
              For privacy questions, use the contact method provided by
              Achango at achango.online.
            </p>
          </section>
        </div>
      </div>
    </ToolLayout>
  );
}
