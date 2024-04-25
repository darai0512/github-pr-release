interface ReleaseMessage {
  title: string;
  body: string;
}
export default function releaseMessage(
  template: string,
  prs: any[]
): ReleaseMessage;
export {};
