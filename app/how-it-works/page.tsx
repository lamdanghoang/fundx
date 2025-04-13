"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User,
  Rocket,
  Users,
  CreditCard,
  BarChart3,
  Award,
  Lock,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const HowItWorks = () => {
  const steps = [
    {
      icon: <User className="h-8 w-8 text-brand-600" />,
      title: "Create an Account",
      description:
        "Connect your blockchain wallet (like MetaMask or Sui Wallet) to verify your identity in a decentralized manner.",
    },
    {
      icon: <Rocket className="h-8 w-8 text-brand-600" />,
      title: "Launch Your Campaign",
      description:
        "Set your funding goal, timeline, and project details. A smart contract is automatically generated for your campaign.",
    },
    {
      icon: <Users className="h-8 w-8 text-brand-600" />,
      title: "Share With Backers",
      description:
        "Promote your campaign to potential backers worldwide. No geographical limitations means global reach.",
    },
    {
      icon: <CreditCard className="h-8 w-8 text-brand-600" />,
      title: "Receive Funding",
      description:
        "Backers send cryptocurrency directly to your campaign's smart contract. Track contributions in real-time.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-brand-600" />,
      title: "Track Progress",
      description:
        "Monitor your campaign's performance with transparent blockchain-based tracking and analytics.",
    },
    {
      icon: <Award className="h-8 w-8 text-brand-600" />,
      title: "Deliver Rewards",
      description:
        "Distribute digital rewards or tokens to your backers automatically through smart contracts.",
    },
  ];

  const benefits = [
    {
      title: "Transparent Funding",
      description:
        "Every transaction is recorded on the blockchain, providing complete transparency for where funds go.",
    },
    {
      title: "Lower Fees",
      description:
        "Cut out middlemen and save on platform fees compared to traditional crowdfunding platforms.",
    },
    {
      title: "Global Access",
      description:
        "Anyone with a crypto wallet can back projects, regardless of their location or banking situation.",
    },
    {
      title: "Automated Distributions",
      description:
        "Smart contracts automatically distribute funds when goals are met or return them if not.",
    },
    {
      title: "Token Rewards",
      description:
        "Offer backers digital tokens that can represent ownership, voting rights, or exclusive benefits.",
    },
    {
      title: "Community Governance",
      description:
        "Implement DAO-style voting for project decisions, giving backers a real voice.",
    },
  ];

  const faqs = [
    {
      question: "What cryptocurrencies can I use to back projects?",
      answer:
        "Currently, we support SUI, ETH, USDT, and USDC. We're working to add more options in the future.",
    },
    {
      question: "How do smart contracts ensure my funds are safe?",
      answer:
        "Smart contracts are self-executing contracts with the terms directly written into code. Funds are only released when predetermined conditions are met, and if the campaign doesn't reach its goal, funds are automatically returned.",
    },
    {
      question: "Do I need technical knowledge to create a campaign?",
      answer:
        "No! Our platform handles all the technical aspects. You just need to fill out the campaign details and connect your wallet.",
    },
    {
      question: "What happens if a project doesn't reach its funding goal?",
      answer:
        "We use an 'all-or-nothing' model. If the campaign doesn't reach its goal by the deadline, all funds are automatically returned to backers through the smart contract.",
    },
    {
      question: "Can I update my campaign after launching?",
      answer:
        "Yes, you can post updates to keep your backers informed. However, core details like funding goals and deadlines are locked in the smart contract and cannot be changed after launch for transparency.",
    },
    {
      question: "How are rewards distributed to backers?",
      answer:
        "Rewards can be distributed as NFTs, tokens, or other digital assets directly to backers' wallets through the smart contract.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-brand-100/50 to-fund-100/50">
        <div className="container text-center">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            FundX Now is revolutionizing crowdfunding with blockchain
            technology. Learn how our decentralized platform connects creators
            with backers worldwide.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">The Process</h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="relative overflow-hidden border-t-4 border-t-brand-500"
              >
                <div className="absolute top-0 right-0 bg-muted px-3 py-1 text-xs font-medium">
                  Step {index + 1}
                </div>
                <CardContent className="pt-8">
                  <div className="mb-4">{step.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/create">
              <Button className="gradient-bg">
                Start Your Campaign
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">
            Benefits of Blockchain Crowdfunding
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Our platform leverages blockchain technology to offer unique
            advantages over traditional crowdfunding methods.
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-background p-6 rounded-lg shadow-sm"
              >
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Lock className="h-16 w-16 text-brand-600 mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Security & Transparency
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Our platform prioritizes security and transparency through
                blockchain technology. Every transaction is immutably recorded,
                smart contracts are audited, and funds are held securely until
                campaign conditions are met.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white mt-0.5 mr-2">
                    ✓
                  </div>
                  <span>
                    All smart contracts undergo rigorous security audits
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white mt-0.5 mr-2">
                    ✓
                  </div>
                  <span>
                    Transparent record of all transactions on the blockchain
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white mt-0.5 mr-2">
                    ✓
                  </div>
                  <span>
                    Automated fund distribution based on predefined rules
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-white mt-0.5 mr-2">
                    ✓
                  </div>
                  <span>
                    Non-custodial platform - we never control your funds
                  </span>
                </li>
              </ul>
            </div>
            <div className="md:w-1/2">
              <Image
                src="https://picsum.photos/seed/security1/800/600"
                alt="Blockchain Security"
                fill
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Still have questions? We&apos;re here to help!
            </p>
            <Button variant="outline">Contact Support</Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-brand-600 to-fund-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to FundX?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of creators and backers to bring innovative ideas
            to life through decentralized funding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/create">
              <Button variant="secondary" size="lg">
                Start a Campaign
              </Button>
            </Link>
            <Link href="/discover">
              <Button
                variant="outline"
                size="lg"
                className="bg-transparent text-white border-white hover:bg-white/10"
              >
                Browse Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HowItWorks;
