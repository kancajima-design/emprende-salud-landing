import { defineRailway, preserve, project, service, volume } from "railway/iac";

export default defineRailway(() => {
  const emprendeSaludLandingVolume = volume("emprende-salud-landing-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "ams", sizeMB: 500 });
  const wahaVolume = volume("waha-volume", { alerts: { usage: { "100": {}, "80": {}, "95": {} } }, allowOnlineResize: true, region: "ams", sizeMB: 500 });
  const emprendeSaludLanding = service("emprende-salud-landing", {
    replicas: { "ams": 1 },
    build: { builder: "NIXPACKS", buildCommand: "npm install && npm run build" },
    deploy: { startCommand: "npm start", restartPolicyType: "ON_FAILURE", restartPolicyMaxRetries: 5 },
    domains: ["www.emprendesalud.net"],
    volumeMounts: { "/app/server/data": emprendeSaludLandingVolume },
    env: { ADMIN_KEY: preserve(), GEMINI_API_KEY: preserve(), META_CAPI_TOKEN: preserve() },
  });

  return project("emprende-salud-landing", {
    resources: [emprendeSaludLanding, emprendeSaludLandingVolume, wahaVolume],
  });
});
