import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { faqs, footerLinks, navigationLinks } from "@/data/data";
import { Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-950 text-white relative pb-10">
      {/* Grid Background */}
      <div
        className="absolute inset-0 bg-[linear-gradient(rgba(10,10,10,0.8),rgba(10,10,10,0.8))]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1h98v98H1V1z' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Content */}
      <div className="relative ">
        {/* Navigation */}
        <nav className="border-b border-gray-800 bg-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-purple-600 p-1.5 rounded">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">MockGPT</span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-8">
                {navigationLinks.map((item, index) => (
                  <Link
                    to={item.link}
                    key={index}
                    className="text-gray-300 hover:text-white"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>

              {/* Right Section */}
              <div className="flex items-center gap-4">
                {/* <Button variant="ghost" size="icon">
                                    <Search className="h-5 w-5" />
                                </Button> */}
                {/* <Button variant="ghost" size="icon">
                                    <MoonIcon className="h-5 w-5" />
                                </Button> */}
                <Button
                  variant="ghost"
                  className="hidden md:inline-flex"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  className="bg-white text-black hover:bg-gray-200"
                  onClick={() => navigate("/signup")}
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
          {/* New Badge */}
          <div className="inline-flex items-center gap-2 bg-[#1C1C1C] rounded-full px-2 py-2 mb-8">
            <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
              New
            </span>
            <span className="text-sm text-gray-300">
              Create custom interviews is out now!
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            AI-based video interview <br /> and{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-purple-700">
              hiring software
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12">
            Increase your hiring team's efficiency with a combination of resume
            scoring, skills assessment, and asynchronous video interviews led
            with AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Button
              variant="outline"
              className="hover:bg-gray-200 text-black text-lg px-8 py-6"
              onClick={() => navigate("/signup")}
            >
              Try Now →
            </Button> */}
            <Button
              variant={"default"}
              className="text-lg px-8 py-6 text-white bg-purple-600 hover:bg-purple-700"
              onClick={() => navigate("/dashboard")}
            >
              Try Now →
            </Button>
          </div>
        </section>

        {/* Pricing Section */}
        {/* <section id="pricing" className="max-w-md xl:max-w-7xl lg:max-w-4xl md:max-w-2xl sm:max-w-xl mx-auto py-6 md:py-12 lg:py-18 ">
                    <div className=" px-4 sm:px-6 lg:px-8 ">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold mb-4">Pricing</h2>
                            <p className="text-gray-400">Choose the plan that's right for you</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                            {pricingPlans.map((plan) => (
                                <Card key={plan.name} className="bg-zinc-900 border-[#2D2D2D] p-6 text-white">
                                    <div className="space-y-6 ">
                                        <div>
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <p className="text-gray-400 text-sm">{plan.description}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-4xl font-bold">{plan.price}</p>
                                            <p className="text-gray-400">{plan.interval}</p>
                                        </div>
                                        <Button variant={'secondary'} className="w-full">
                                            View
                                        </Button>
                                        <div className="space-y-4 pt-4 border-t border-[#2D2D2D]">
                                            <p className="font-medium">PLAN DETAILS</p>
                                            <ul className="space-y-3">
                                                {plan.features.map((feature, index) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <Check className="h-5 w-5 text-green-500 shrink-0" />
                                                        <span className="text-sm text-gray-300">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section> */}

        {/* FAQs Section */}
        <section id="faqs" className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-purple-500 text-sm font-medium">FAQS</span>
              <h2 className="text-4xl font-bold mt-2 mb-4">Common Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-zinc-900 rounded-lg border border-[#2D2D2D] px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-400">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Try Now Section */}
        <section className="max-w-md xl:max-w-6xl lg:max-w-4xl md:max-w-2xl sm:max-w-xl mx-auto rounded-xl mb-10 py-24 bg-zinc-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-600 p-1.5 rounded">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-8">Try MockGPT today</h2>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200"
              onClick={() => navigate("/dashboard")}
            >
              Get started - It's free →
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-md xl:max-w-6xl lg:max-w-4xl md:max-w-2xl sm:max-w-xl mx-auto bg-zinc-900 border-t border-[#2D2D2D] pt-16 pb-8 rounded-2xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-600 p-1.5 rounded">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">MockGPT</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Hire Smarter, Not Harder!
                </p>
              </div>

              {footerLinks.map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold mb-4">{section.heading}</h3>
                  <ul className="space-y-3">
                    {section.items.map((item, index) => (
                      <li key={index}>
                        <Link
                          to={item.link}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Copyright */}
            <div className="pt-8 border-t border-[#2D2D2D] text-center">
              <p className="text-gray-400 text-sm">
                © MockGPT.in. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
