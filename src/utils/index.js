export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const conditionalLog = (...args) => {
  const isLoggingEnabled = localStorage.getItem("debugLogging") === "true";
  if (isLoggingEnabled) {
    console.log(...args);
  }
};