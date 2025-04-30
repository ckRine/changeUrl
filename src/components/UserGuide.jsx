import React from "react";
import { useTranslation } from "react-i18next";

const UserGuide = ({ closeGuide }) => {
  const { t } = useTranslation();

  return (
    <div className="user-guide">
      <h2>{t("userGuide.title")}</h2>
      <h3>{t("userGuide.overview")}</h3>
      <p>{t("userGuide.overviewText")}</p>
      <h3>{t("userGuide.features")}</h3>
      <ul>
        {t("userGuide.featuresList", { returnObjects: true }).map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <h3>{t("userGuide.howItWorks")}</h3>
      <ul>
        {t("userGuide.howItWorksSteps", { returnObjects: true }).map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ul>
      <h3>{t("userGuide.examples")}</h3>
      <div>
        <h4>{t("userGuide.example1.title")}</h4>
        <p>{t("userGuide.example1.goal")}</p>
        <p>{t("userGuide.example1.setup")}</p>
        <p>{t("userGuide.example1.result")}</p>
      </div>
      <div>
        <h4>{t("userGuide.example2.title")}</h4>
        <p>{t("userGuide.example2.goal")}</p>
        <p>{t("userGuide.example2.setup")}</p>
        <p>{t("userGuide.example2.result")}</p>
      </div>
      <div>
        <h4>{t("userGuide.example3.title")}</h4>
        <p>{t("userGuide.example3.goal")}</p>
        <p>{t("userGuide.example3.setup")}</p>
        <p>{t("userGuide.example3.result")}</p>
      </div>
      <h3>{t("userGuide.tips")}</h3>
      <ul>
        {t("userGuide.tipsList", { returnObjects: true }).map((tip, index) => (
          <li key={index}>{tip}</li>
        ))}
      </ul>
      <h3>{t("userGuide.support")}</h3>
      <p>{t("userGuide.supportText")}</p>
      <button className="btn close-guide" onClick={closeGuide}>
        {t("userGuide.close")}
      </button>
    </div>
  );
};

export default UserGuide;