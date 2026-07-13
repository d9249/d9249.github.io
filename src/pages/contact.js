import * as React from "react";
import { Link } from "gatsby";
import {
  ArrowUpRight,
  BadgeCheck,
  BookOpenText,
  Boxes,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Mail,
} from "lucide-react";
import Layout from "../components/Layout";
import { heroLinks } from "../data/profile";

const contactChannelMeta = {
  Email: {
    icon: Mail,
    value: "dodo9249@gmail.com",
  },
  GitHub: {
    icon: GitBranch,
    value: "github.com/d9249",
  },
  "Google Scholar": {
    icon: GraduationCap,
    value: "논문 및 인용 기록",
  },
  ORCID: {
    icon: BadgeCheck,
    value: "0000-0002-7720-8622",
  },
};

const focusItems = [
  {
    description:
      "운영 가능한 AI 시스템과 사용자가 체감하는 제품 경험을 설계합니다.",
    icon: Boxes,
    label: "Product AI",
    linkLabel: "프로젝트 보기",
    to: "/projects/",
  },
  {
    description:
      "추천 시스템, RAG, Document AI와 멀티에이전트 연구를 제품 판단의 근거로 연결합니다.",
    icon: FlaskConical,
    label: "Research",
    linkLabel: "연구 보기",
    to: "/research/",
  },
  {
    description:
      "실험과 구현 과정에서 얻은 판단을 다시 활용할 수 있는 공개 기록으로 남깁니다.",
    icon: BookOpenText,
    label: "Public Notes",
    linkLabel: "블로그 보기",
    to: "/blog/",
  },
];

const ContactPage = () => {
  const emailChannel = heroLinks.find(({ label }) => label === "Email");

  return (
    <Layout>
      <div className="contact-page">
        <section className="shell contact-hero" aria-labelledby="contact-title">
          <div className="contact-intro">
            <h1 id="contact-title">
              연구를 제품으로, 제품을 신뢰로 연결합니다.
            </h1>
            <p>
              RAG·Agents·OCR·Vision 연구를 실제 사용자가 신뢰할 수 있는 제품과
              운영 흐름으로 만듭니다.
            </p>
            {emailChannel ? (
              <a
                className="button-primary contact-cta"
                href={emailChannel.href}
              >
                <Mail aria-hidden="true" />
                <span>이메일 보내기</span>
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </div>

          <address className="contact-directory" aria-label="연락처 디렉터리">
            {heroLinks.map((channel) => {
              const meta = contactChannelMeta[channel.label];
              const Icon = meta?.icon || ArrowUpRight;
              const isExternal = channel.href.startsWith("http");

              return (
                <a
                  className="contact-channel"
                  href={channel.href}
                  key={channel.label}
                  rel={isExternal ? "noreferrer" : undefined}
                  target={isExternal ? "_blank" : undefined}
                >
                  <span className="contact-channel-icon" aria-hidden="true">
                    <Icon />
                  </span>
                  <span className="contact-channel-copy">
                    <strong>{channel.label}</strong>
                    <span>{meta?.value || channel.href}</span>
                  </span>
                  <ArrowUpRight
                    className="contact-channel-arrow"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </address>
        </section>

        <section
          className="shell contact-focus"
          aria-labelledby="contact-focus-title"
        >
          <h2 id="contact-focus-title">Open Focus</h2>
          <ul className="contact-focus-list">
            {focusItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <Link className="contact-focus-row" to={item.to}>
                    <span className="contact-focus-icon" aria-hidden="true">
                      <Icon />
                    </span>
                    <span className="contact-focus-copy">
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </span>
                    <span className="contact-focus-link">
                      {item.linkLabel}
                      <ArrowUpRight aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

export default ContactPage;

export const Head = () => (
  <>
    <title>Contact</title>
    <meta name="description" content="Sangmin Lee 연락 및 소개 페이지입니다." />
  </>
);
