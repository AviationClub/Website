import LoadingManager from "@/components/loading-manager";
import ContactUsEmails from "@/components/contact-us-emails";
import { MIN_LOAD_TIME_PAGES } from "@/utils/constants";

const ContactUsPage = () => {
  // JSX
  return (
    <LoadingManager minLoadTime={MIN_LOAD_TIME_PAGES}>
      <main className="grid min-h-screen place-content-center text-center">
        <div className="flex flex-col gap-[4.8rem]">
          <div>
            <h1 className="font-sans text-[max(80px,24.8rem)] leading-none">
              Get in touch
            </h1>
            <p className="mx-auto max-w-[max(360px,133.4rem)] font-serif text-[max(16px,4.8rem)]">
              Whether you have a question, a proposal, or just a random thought
              you&apos;d like to share, we&apos;d love to hear from you! Feel
              free to reach out, and we&apos;ll get back to you as soon as
              possible. Let&apos;s start the conversation!
            </p>
          </div>
          <div className="flex flex-col gap-12">
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="h-[0.8rem] w-[calc(100vw-11.2rem)] rounded-full bg-primary-dark"></div>
              <ContactUsEmails />
              <div className="h-[0.8rem] w-[calc(100vw-11.2rem)] rounded-full bg-primary-dark"></div>
            </div>
            <p className="font-serif text-[max(16px,4rem)] leading-none">
              Believe me we will get back to you
            </p>
          </div>
        </div>
      </main>
    </LoadingManager>
  );
};

export default ContactUsPage;
