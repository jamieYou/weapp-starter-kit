export default function urlConcat(...args) {
  return args.map(str => str.replace(/^\/|\/$/g, '')).join('/')
}
