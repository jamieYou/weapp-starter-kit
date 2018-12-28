const environmentConfig = {
  development: {
    apiOrigin: process.env.API_URL
  },
  staging: {
    apiOrigin: process.env.API_URL
  },
  production: {
    apiOrigin: process.env.API_URL
  },
}

export const { apiOrigin } = environmentConfig[process.env.NODE_ENV]
