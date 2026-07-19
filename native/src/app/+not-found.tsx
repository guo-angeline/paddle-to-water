import { Redirect } from "expo-router";

/** Any unrecognized link shape lands on the single home screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
