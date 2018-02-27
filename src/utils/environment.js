const ipv4 = process.env.ipv4
const NODE_ENV = process.env.NODE_ENV
const PORT = process.env.PORT

const environmentConfig = {
  "development": {
    apiOrigin: `https://cnodejs.org`
  },
  "staging": {
    apiOrigin: `http://${ipv4}:${PORT}`
  },
  "production": {
    apiOrigin: `http://${ipv4}:${PORT}`
  },
}

export const { apiOrigin } = environmentConfig[NODE_ENV]
