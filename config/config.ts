export const TEST_CONFIG = {
  credentials: {
    email: process.env.TEST_USER || "gokulapriya.subramani@konnectify.co",
    name: process.env.TEST_NAME || "Gokulapriya",
    domain: process.env.TEST_DOMAIN || "gp4",
    password: process.env.TEST_PASSWORD || "Konnectify@123",
    website: process.env.TEST_WEBSITE || "www.gokulapriya.com",
  },

  loginCredentials: {
    valid: {
      email: process.env.TEST_USER || "gokulapriya.subramani@konnectify.co",
      password: process.env.TEST_PASSWORD || "Konnectify@123",
    },
    invalid: {
      email: "invalid@konnectify.co",
      password: "WrongPassword123",
    },
  },

  urls: {
    base: "https://gp4.prestaging.us.konnectify.dev/admin/ui/en",
    baseDomain: "prestaging.us.konnectify.dev",
    baseURL: "prestaging.us.konnectify.dev/admin/ui/en/workflow",
    //base: "https://gp1.stack1.us.konnectify.dev/admin/ui/en",
    //baseDomain: "stack1.us.konnectify.dev",
    //baseURL: "stack1.us.konnectify.dev/admin/ui/en/workflow",

    login: "/login",
    signup: "/signup",
    domain: "gp4",
    dashboard: "/dashboard",
    new: "/new",
    freshsalesApp: "/apps/freshsales-1.0.0",
  },
  timeouts: {
    short: 5000,
    default: 10000,
    long: 30000,
  },
  connection: {
    Highperformr: {
      name: "Highperformr",
      baseUrl: "https://app.highperformr.ai",
      apiKey: "hp-3d6f9b47-f2c5-4871-9486-d6de879898e7",
    },
    Freshsales: {
      name: "Freshsales",
      baseUrl: "https://konnectify.freshsales.io",
      apiKey: "f8c1b3d4-2e5a-4c6b-9f0d-7e8b9c0d1e2f",
    },
    Freshdesk: {
      name: "Freshdesk",
      baseUrl: "https://konnectify.freshdesk.com",
      apiKey: "d3f4e5b6-7a8b-4c6d-9f0d-1e2f3a4b5c6",
    },
  },
};
