export default function urlConcat(...args: string[]): string {
  return args.map((str: string) => str.replace(/^\/|\/$/g, '')).join('/')
}
