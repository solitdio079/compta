import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";

export function meta() {
  return [
    { title: "Contact Us - Compta" },
    { name: "description", content: "Get in touch with Compta." },
  ];
}

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-base-100 rounded-lg shadow-base-300/20 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6">
              <div className="flex items-center gap-3">
                <span className="icon-[tabler--mail] size-7 text-primary"></span>
                <div>
                  <h1 className="text-2xl font-bold">Contact Us</h1>
                  <p className="text-base-content/70">We’d love to hear from you.</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">How we can help</h2>
                <p className="text-base-content/80">
                  Questions about your reports, Excel exports, or how to best track your trips and expenses? Send us a message and we’ll
                  get back to you.
                </p>

                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--clock] size-5 text-primary"></span>
                    <span className="text-base-content/80">Mon–Fri, 9:00–18:00</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--map-pin] size-5 text-primary"></span>
                    <span className="text-base-content/80">Remote-first</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="icon-[tabler--shield-check] size-5 text-primary"></span>
                    <span className="text-base-content/80">We never share your data</span>
                  </div>
                </div>
              </div>

              <form className="grid gap-5">
                <div>
                  <label className="label-text" htmlFor="name">Name</label>
                  <input id="name" type="text" className="input input-bordered w-full" placeholder="Your name" />
                </div>

                <div>
                  <label className="label-text" htmlFor="email">Email</label>
                  <input id="email" type="email" className="input input-bordered w-full" placeholder="you@example.com" />
                </div>

                <div>
                  <label className="label-text" htmlFor="subject">Subject</label>
                  <input id="subject" type="text" className="input input-bordered w-full" placeholder="How can we help?" />
                </div>

                <div>
                  <label className="label-text" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    className="textarea textarea-bordered w-full min-h-32"
                    placeholder="Write your message..."
                  />
                </div>

                <div className="flex justify-end">
                  <button type="button" className="btn btn-primary">
                    <span className="icon-[tabler--send] size-5"></span>
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
